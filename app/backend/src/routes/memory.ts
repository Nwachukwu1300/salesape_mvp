import express, { type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getEmbedding } from '../utils/openai-client.js';
import { redisClient, upsertVector } from '../utils/redis-client.js';

const router = express.Router();

export interface MemoryCreateBody {
  userId: string;
  text: string;
  metadata?: Record<string, any>;
}

// POST /api/memory
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as MemoryCreateBody;
    if (!body || !body.userId || !body.text) {
      return res.status(400).json({ error: 'userId and text are required' });
    }

    // compute embedding via existing helper (wraps OpenAI)
    const embedding = await getEmbedding(body.text);
    if (!embedding || !Array.isArray(embedding)) {
      return res.status(500).json({ error: 'Failed to compute embedding' });
    }

    const id = uuidv4();
    const vectorRecord = {
      id,
      userId: body.userId,
      text: body.text,
      metadata: body.metadata || {},
      embedding,
      createdAt: Date.now(),
    };

    // store vector using redis helper (assumes upsertVector abstracts index name/key)
    await upsertVector(id, vectorRecord);

    return res.status(201).json({ id, status: 'ok' });
  } catch (err: any) {
    console.error('POST /api/memory error', err);
    return res.status(500).json({ error: err?.message || 'unknown error' });
  }
});

export default router;
