const request = require('supertest');
const express = require('express');
const memoryRoute = require('../routes/memory.js').default;

jest.mock('../utils/openai-client.js', () => ({
  getEmbedding: jest.fn(async (text) => new Array(1536).fill(0.001)),
}));
jest.mock('../utils/redis-client.js', () => ({
  upsertVector: jest.fn(async (id, record) => true),
  redisClient: { ping: async () => 'PONG' },
}));

const app = express();
app.use(express.json());
app.use('/api/memory', memoryRoute);

describe('POST /api/memory', () => {
  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/memory').send({});
    expect(res.status).toBe(400);
  });

  it('creates memory and returns id when valid', async () => {
    const payload = { userId: 'user_123', text: 'Remember this thing', metadata: { source: 'test' } };
    const res = await request(app).post('/api/memory').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('ok');
  });
});
