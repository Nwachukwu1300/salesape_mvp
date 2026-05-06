import { Router } from 'express';
import type { Response } from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import type { AuthMiddleware, AuthRequest } from './types.js';

export function createTtsRouter(authenticateToken: AuthMiddleware) {
  const router = Router();

  router.post('/tts', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const text = String(req.body?.text || '').trim();
      if (!text) {
        return res.status(400).json({ error: 'Text is required for TTS' });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OPENAI_API_KEY missing' });
      }

      const voice = String(req.body?.voice || 'nova');
      const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';

      const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          voice,
          input: text,
          response_format: 'mp3',
        }),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        return res.status(upstream.status).json({
          error: 'OpenAI TTS request failed',
          details: errText,
        });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Transfer-Encoding', 'chunked');

      const body = (upstream as any).body;
      if (!body || typeof body.pipe !== 'function') {
        const buffer = await upstream.arrayBuffer();
        return res.status(200).send(Buffer.from(buffer));
      }

      body.pipe(res);
    } catch (err) {
      logger.error('TTS proxy error', { error: String(err) });
      res.status(500).json({ error: 'Failed to generate TTS audio' });
    }
  });

  return router;
}
