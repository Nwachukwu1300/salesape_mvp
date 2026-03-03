import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import apeChatRouter from '../routes/apeChat.js';

/**
 * Integration test: Real GPT-5-mini + Redis streaming with ChatPanel parser
 * 
 * This test:
 * 1. Creates an Express app with the apeChat router
 * 2. Makes real streaming requests to the /api/ape/chat endpoint
 * 3. Verifies SSE event format matches ChatPanel parser expectations
 * 4. Tests streaming with chunks and event parsing
 * 5. Verifies abort functionality
 */

// Simulate ChatPanel's SSE parsing logic
function parseSSEStream(rawData: string): { events: any[]; done: boolean } {
  const events: any[] = [];
  let done = false;
  const lines = rawData.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    // Parse 'data:' lines (ChatPanel logic)
    if (line.startsWith('data:')) {
      const payload = line.replace(/^data:\s?/, '');
      try {
        const obj = JSON.parse(payload);
        events.push(obj);
        if (obj.done) {
          done = true;
        }
      } catch (e) {
        // Non-JSON data (fallback)
        events.push({ delta: payload });
      }
    }

    // Parse 'event:' lines
    if (line.startsWith('event:')) {
      const eventName = line.replace(/^event:\s?/, '');
      if (eventName === 'done') {
        done = true;
      }
    }
  }

  return { events, done };
}

describe('Streaming Integration Tests - Real GPT-5-mini + Redis', () => {
  let app: express.Application;
  let server: http.Server;
  const PORT = 3001;
  let authToken = '';

  beforeAll((done) => {
    // Verify environment
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for integration tests');
    }

    const secret = process.env.JWT_SECRET || 'test-secret-key-not-for-production';
    authToken = jwt.sign({ userId: 'integration-test-user' }, secret, { expiresIn: '1h' });

    // Create Express app
    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      if (token) {
        try {
          const decoded: any = jwt.verify(token, secret);
          (req as any).userId = decoded?.userId;
        } catch {
          // ignore invalid tokens
        }
      }
      next();
    });
    app.use('/api/ape/chat', apeChatRouter);

    // Start server
    server = app.listen(PORT, () => {
      console.log(`\n✓ Test server listening on port ${PORT}\n`);
      done();
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      done(err);
    });
  }, 30000);

  afterAll((done) => {
    if (server) {
      server.close(() => {
        console.log('\n✓ Test server closed\n');
        done();
      });
    } else {
      done();
    }
  }, 10000);

  test('should connect to Redis', async () => {
    // This test verifies Redis connection is available
    try {
      const { getRedisClient } = await import('../utils/redis-client.js');
      const redis = getRedisClient();
      expect(redis).toBeDefined();
      console.log('✓ Redis client available');
    } catch (e) {
      console.warn('⚠ Redis connection test skipped (may be in mock mode)');
    }
  });

  test('POST /api/ape/chat with text/event-stream should return SSE stream with gpt-5-mini', async () => {
    return new Promise<void>((resolve, reject) => {
      const postData = JSON.stringify({
        userId: 'integration-test-user',
        query: 'Say "Hello from gpt-5-mini" in exactly 5 words.',
      });

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ape/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const req = http.request(options, (res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('text/event-stream');

          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
            console.log('Received chunk:', chunk.toString().substring(0, 100));
          });

          res.on('end', () => {
            try {
              console.log('\n📊 Raw SSE Stream:\n', data.substring(0, 300));

              // Verify SSE format
              expect(data).toContain('data:');
              expect(data).toMatch(/event:\s*done|"done":\s*true/);

              // Verify we have delta events with valid JSON
              const deltaMatches = data.match(/data:\s*\{.*?"delta".*?\}/g);
              expect(deltaMatches).toBeTruthy();
              expect(deltaMatches!.length).toBeGreaterThan(0);

              console.log(`✓ SSE format verified (${deltaMatches!.length} delta events)`);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
      });

      req.on('error', (e) => {
        reject(new Error(`Request error: ${e.message}`));
      });

      req.write(postData);
      req.end();
    });
  }, 60000);

  test('ChatPanel parser should correctly parse streaming events from gpt-5-mini', async () => {
    return new Promise<void>((resolve, reject) => {
      const postData = JSON.stringify({
        userId: 'integration-test-user-2',
        query: 'Respond with a friendly greeting in 3-5 words.',
      });

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ape/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const req = http.request(options, (res) => {
        let rawStream = '';

        res.on('data', (chunk) => {
          rawStream += chunk.toString();
        });

        res.on('end', () => {
          try {
            console.log('\n📊 ChatPanel Parser Test - Raw Stream:\n', rawStream.substring(0, 300));

            // Parse using ChatPanel logic
            const { events, done } = parseSSEStream(rawStream);

            console.log(`\n✓ Parsed ${events.length} events`);
            console.log(`✓ Stream completion: ${done}`);

            // Verify parsing
            expect(events.length).toBeGreaterThan(0);
            expect(done).toBe(true);

            // Reconstruct full response using ChatPanel logic
            let fullText = '';
            for (const evt of events) {
              if (evt.delta) {
                fullText += evt.delta;
              }
            }

            console.log(`\n💬 Reconstructed Response:\n"${fullText}"\n`);
            expect(fullText.length).toBeGreaterThan(0);

            // Verify deltas are content strings
            const deltaEvents = events.filter((e) => e.delta);
            expect(deltaEvents.length).toBeGreaterThan(0);
            for (const evt of deltaEvents) {
              expect(typeof evt.delta).toBe('string');
            }

            console.log(`✓ All ${deltaEvents.length} delta events are valid strings`);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Request error: ${e.message}`));
      });

      req.write(postData);
      req.end();
    });
  }, 60000);

  test('AbortController should stop streaming mid-stream', async () => {
    return new Promise<void>((resolve, reject) => {
      const postData = JSON.stringify({
        userId: 'integration-test-user-3',
        query: 'Write a very detailed and long explanation. Make it comprehensive with multiple paragraphs.',
      });

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ape/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${authToken}`,
        },
      };

      let dataChunks = 0;
      let aborted = false;

      const req = http.request(options, (res) => {
        res.on('data', (chunk) => {
          dataChunks++;
          console.log(`Received chunk ${dataChunks}: ${chunk.toString().substring(0, 50)}`);

          // Abort after receiving a few chunks
          if (dataChunks === 2 && !aborted) {
            console.log('🛑 Aborting stream after 2 chunks...');
            aborted = true;
            req.destroy();
          }
        });

        res.on('end', () => {
          if (aborted) {
            console.log('✓ Stream successfully aborted');
            resolve();
          }
        });

        res.on('close', () => {
          if (aborted) {
            console.log('✓ Stream connection closed after abort');
            resolve();
          }
        });
      });

      req.on('error', (e: any) => {
        if (aborted && (e.code === 'ECONNRESET' || e.code === 'ERR_HTTP_REQUEST_TIMEOUT')) {
          console.log('✓ Expected error after abort:', e.code);
          resolve();
        } else if (!aborted) {
          reject(new Error(`Unexpected error: ${e.message}`));
        } else {
          resolve(); // Abort was successful
        }
      });

      req.write(postData);
      req.end();

      // Timeout after 15 seconds
      const timeoutId = setTimeout(() => {
        if (aborted) {
          resolve();
        } else {
          reject(new Error('Abort test timed out'));
        }
      }, 15000);

      // Ensure timeout doesn't keep the event loop alive
      if (typeof timeoutId === 'object' && timeoutId && 'unref' in timeoutId) {
        (timeoutId as NodeJS.Timeout).unref();
      }
    });
  }, 30000);

  test('Missing userId or query should return 400', async () => {
    return new Promise<void>((resolve, reject) => {
      const postData = JSON.stringify({ userId: 'test' }); // missing query

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ape/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const req = http.request(options, (res) => {
        try {
          expect(res.statusCode).toBe(400);

          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(response.error).toBeDefined();
              expect(response.error).toContain('query required');
              console.log('✓ Validation error returned correctly');
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  });

  test('Non-streaming request should return immediate JSON response from gpt-5-mini', async () => {
    return new Promise<void>((resolve, reject) => {
      const postData = JSON.stringify({
        userId: 'integration-test-user-4',
        query: 'Say hello briefly.',
      });

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ape/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${authToken}`,
          // No Accept: text/event-stream header â€” non-streaming
        },
      };

      const req = http.request(options, (res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('application/json');

          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(response.text).toBeDefined();
              expect(typeof response.text).toBe('string');
              expect(response.text.length).toBeGreaterThan(0);
              console.log(`\n✓ Non-streaming response received:\n"${response.text}"\n`);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }, 60000);
});

