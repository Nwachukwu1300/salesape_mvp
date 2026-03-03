import express, { type Request, type Response } from 'express';
import OpenAIClient from '../utils/openai-client.js';
import { getRedisClient } from '../utils/redis-client.js';

const router = express.Router();

async function assemblePrompt(userId: string, query: string): Promise<string> {
  const client = getRedisClient();
  let memoriesText = '';
  try {
    const keys = await client.keys(`memory:${userId}:*`);
    const recent = keys.slice(0, 5);
    for (const key of recent) {
      const value = await client.get(key);
      if (!value) continue;
      try {
        const parsed = JSON.parse(value);
        memoriesText += `Memory: ${parsed.text}\n`;
      } catch {
        // Ignore malformed memory records.
      }
    }
  } catch {
    // Ignore memory read errors for chat availability.
  }

  return [
    'You are APE, the SalesAPE assistant.',
    'Be concise, friendly, and practical.',
    'Use memories if relevant.',
    '',
    memoriesText,
    `User query: ${query}`,
  ].join('\n');
}

function sseSend(res: Response, data: string, event?: string) {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
}

async function handleApeChat(req: Request, res: Response) {
  const accept = req.headers.accept || '';
  const isSSE = accept.includes('text/event-stream');
  const { query } = req.body || {};
  const userId = (req as any).userId as string | undefined;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!query) return res.status(400).json({ error: 'query required' });

  const prompt = await assemblePrompt(userId, query);
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';

  if (!isSSE) {
    try {
      const resp = await (OpenAIClient as any).responses.create({ model, input: prompt });
      const text =
        (resp as any)?.output_text ||
        (resp as any)?.output?.[0]?.content?.[0]?.text ||
        '';
      return res.json({ id: (resp as any).id || null, text });
    } catch (err: any) {
      console.error('/api/ape/chat error', err);
      return res.status(500).json({ error: err?.message || 'unknown' });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const stream = await (OpenAIClient as any).responses.stream({ model, input: prompt });
    let sentAny = false;
    let sentDone = false;

    for await (const event of stream) {
      if (!event) continue;
      if (event.type && String(event.type).includes('error')) {
        sseSend(res, JSON.stringify({ error: event.error || 'response error' }), 'error');
        sentAny = true;
        continue;
      }
      const deltaCandidate =
        event?.delta?.content ??
        event?.delta?.text ??
        event?.text ??
        event?.output_text ??
        event?.delta;
      const delta =
        typeof deltaCandidate === 'string'
          ? deltaCandidate
          : Array.isArray(deltaCandidate)
            ? deltaCandidate.join('')
            : '';
      if (delta) {
        sseSend(res, JSON.stringify({ delta }));
        sentAny = true;
        continue;
      }
      if (typeof event === 'string') {
        sseSend(res, JSON.stringify({ delta: event }));
        sentAny = true;
        continue;
      }
      if (event.type === 'response.complete' || event.type === 'response.output_text.done') {
        sseSend(res, JSON.stringify({ done: true }), 'done');
        sentAny = true;
        sentDone = true;
        continue;
      }
    }
    if (!sentDone) {
      sseSend(res, JSON.stringify({ done: true }), 'done');
      sentAny = true;
      sentDone = true;
    }
  } catch (err: any) {
    sseSend(res, JSON.stringify({ error: err?.message || 'stream error' }), 'error');
  } finally {
    try {
      res.end();
    } catch {
      // no-op
    }
  }
}

// Backward-compatible endpoints
router.post('/', handleApeChat);
router.post('/chat', handleApeChat);

export default router;
