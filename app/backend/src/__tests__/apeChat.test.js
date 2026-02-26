const request = require('supertest');
const express = require('express');

jest.mock('../utils/openai-client.js', () => ({
  default: {
    responses: {
      create: jest.fn(async () => ({ id: 'resp1', output: [{ content: 'Full reply' }] })),
      stream: jest.fn(async function* () {
        yield { type: 'response.delta', delta: { content: 'Hel' } };
        yield { type: 'response.delta', delta: { content: 'lo ' } };
        yield { type: 'response.delta', delta: { content: 'World' } };
        yield { type: 'response.complete' };
      }),
    },
  },
}));

jest.mock('../utils/redis-client.js', () => ({ getRedisClient: jest.fn(() => ({ keys: async () => [], get: async () => null })) }));

const app = express();
app.use(express.json());
const apeChat = require('../routes/apeChat.js').default;
app.use('/api/ape/chat', apeChat);

describe('POST /api/ape/chat', () => {
  it('returns 400 when missing fields', async () => {
    const res = await request(app).post('/api/ape/chat').send({});
    expect(res.status).toBe(400);
  });

  it('returns non-streaming reply', async () => {
    const res = await request(app).post('/api/ape/chat').send({ userId: 'u1', query: 'hi' });
    expect(res.status).toBe(200);
    expect(res.body.text).toBeDefined();
  });

  it('streams via SSE', async () => {
    const res = await request(app).post('/api/ape/chat').set('Accept','text/event-stream').send({ userId: 'u1', query: 'hi' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('data:');
    expect(res.text).toContain('done');
  });
});
