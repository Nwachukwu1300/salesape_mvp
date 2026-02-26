import express, { type Request, type Response } from 'express';
import OpenAIClient from '../utils/openai-client.js';
import { getRedisClient } from '../utils/redis-client.js';

const router = express.Router();

// Helper: assemble prompt from query, recent convo, and top-k memories (placeholder implementations)
async function assemblePrompt(userId: string, query: string): Promise<string> {
  const client = getRedisClient();
  let memoriesText = '';
  try {
    const keys = await client.keys(`memory:${userId}:*`);
    const recent = keys.slice(0, 5);
    for (const k of recent) {
      const v = await client.get(k);
      if (v) {
        try {
          const parsed = JSON.parse(v);
          memoriesText += `Memory: ${parsed.text}\n`;
        } catch {}
      }
    }
  } catch (e) {
    // ignore
  }
  const prompt = `You are APE assistant. Use the following memories when answering if relevant:\n${memoriesText}\nUser query: ${query}`;
  return prompt;
}

// Helper: send SSE event
function sseSend(res: Response, data: string, event?: string) {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
}

// POST /api/ape/chat — streaming via OpenAI Responses streaming API (gpt-5-mini)
router.post('/', async (req: Request, res: Response) => {
  const accept = req.headers.accept || '';
  const isSSE = accept.includes('text/event-stream');
  const { userId, query } = req.body || {};
  if (!userId || !query) return res.status(400).json({ error: 'userId and query required' });

  const prompt = await assemblePrompt(userId, query);

  // Non-streaming path
  if (!isSSE) {
    try {
      const client = OpenAIClient;
      const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';
      const resp = await client.responses.create({ model, input: prompt });
      const text = (resp.output && resp.output[0] && (resp.output[0] as any).content) || JSON.stringify(resp);
      return res.json({ id: (resp as any).id || null, text });
    } catch (err: any) {
      console.error('/api/ape/chat error', err);
      return res.status(500).json({ error: err?.message || 'unknown' });
    }
  }

  // Streaming path (SSE) — use SDK streaming iterator
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = OpenAIClient;
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';

  try {
    // Start streaming responses from the SDK — responses.stream returns an async iterator
    // The exact SDK shape may vary; we handle chunks and forward tokens as SSE events
    const stream = await (client as any).responses.stream({ model, input: prompt });

    for await (const event of stream) {
      // event may be: { type: 'response.delta', delta: { content: '...' } } or other control events
      try {
        if (!event) continue;
        // Some SDKs yield strings or objects; normalize
        if (typeof event === 'string') {
          sseSend(res, JSON.stringify({ delta: event }));
        } else if (event.type === 'response.delta' && event.delta) {
          // delta content could be array or string
          const d = (event.delta.content && (Array.isArray(event.delta.content) ? event.delta.content.join('') : event.delta.content)) || '';
          if (d) sseSend(res, JSON.stringify({ delta: d }));
        } else if (event.type === 'response.error') {
          sseSend(res, JSON.stringify({ error: event.error || 'response error' }), 'error');
        } else if (event.type === 'response.complete') {
          sseSend(res, JSON.stringify({ done: true }), 'done');
        } else if (event.delta && event.delta.content) {
          const d = Array.isArray(event.delta.content) ? event.delta.content.join('') : event.delta.content;
          sseSend(res, JSON.stringify({ delta: d }));
        }
      } catch (e) {
        // send error but continue
        sseSend(res, JSON.stringify({ error: (e as any).message || 'chunk error' }), 'error');
      }
    }

    // end stream
    try { res.end(); } catch {}
  } catch (err: any) {
    sseSend(res, JSON.stringify({ error: err?.message || 'stream error' }), 'error');
    try { res.end(); } catch {}
  }

});

export default router;
