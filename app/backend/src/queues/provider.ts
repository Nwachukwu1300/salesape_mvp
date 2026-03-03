export type QueueProvider = 'bullmq' | 'pgboss';

export function getQueueProvider(): QueueProvider {
  const configured = (process.env.QUEUE_PROVIDER || '').trim().toLowerCase();
  if (configured === 'pgboss') return 'pgboss';
  if (configured === 'bullmq') return 'bullmq';

  // Default: Redis/BullMQ in production, pg-boss for local/dev simplicity
  return process.env.NODE_ENV === 'production' ? 'bullmq' : 'pgboss';
}

export function isBullMQProvider(): boolean {
  return getQueueProvider() === 'bullmq';
}

