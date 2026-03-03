import { createRequire } from 'module';
import type { RepurposingJob } from './index.js';
import { createContextLogger } from '../utils/logger.js';

const logger = createContextLogger('pgboss');
const require = createRequire(import.meta.url);

const REPURPOSING_QUEUE = 'repurposing';

let bossSingleton: any = null;

interface PgBossJob<T> {
  id?: string;
  data: T;
}

async function getPgBoss(): Promise<any> {
  if (bossSingleton) return bossSingleton;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for pg-boss queue provider');
  }

  const PgBoss = require('pg-boss');
  const boss = new PgBoss(connectionString);

  boss.on('error', (error: unknown) => {
    logger.error('pg-boss error', { error: String(error) });
  });

  await boss.start();
  bossSingleton = boss;
  logger.info('pg-boss started');
  return bossSingleton;
}

export async function enqueueRepurposingPgBoss(
  data: RepurposingJob,
  options?: { attempts?: number; delay?: number }
) {
  const boss = await getPgBoss();
  const id = await boss.send(REPURPOSING_QUEUE, data, {
    retryLimit: options?.attempts ?? 2,
    retryDelay: 3,
    startAfter: options?.delay ? new Date(Date.now() + options.delay) : undefined,
  });
  return { id };
}

export async function startRepurposingPgBossWorker(
  handler: (jobData: RepurposingJob, jobId?: string) => Promise<void>
) {
  const boss = await getPgBoss();

  const stop = await boss.work(
    REPURPOSING_QUEUE,
    { teamSize: 5, newJobCheckIntervalSeconds: 1 },
    async (job: PgBossJob<RepurposingJob>) => {
      await handler(job.data, job.id);
    }
  );

  logger.info('pg-boss repurposing worker started');
  return { stop };
}

export async function getPgBossJobCounts() {
  const boss = await getPgBoss();
  const stateCounts = await boss.getQueueSize(REPURPOSING_QUEUE);
  return {
    waiting: stateCounts || 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  };
}
