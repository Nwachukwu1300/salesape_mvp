import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
const client = new OpenAI({ apiKey });

export async function getEmbedding(text: string): Promise<number[]> {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing in environment');
  // default model - allow override via env
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  const resp = await client.embeddings.create({ model, input: text });
  // may return multiple; take first
  const data = resp.data && resp.data[0] && (resp.data[0] as any).embedding;
  if (!data) throw new Error('No embedding returned');
  return data as number[];
}

export default client;
