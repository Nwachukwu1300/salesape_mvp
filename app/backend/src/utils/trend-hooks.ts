import type { Platform } from '../types/workflow.types.js';

type TrendHook = {
  hook: string;
  source: 'seed' | 'refreshed';
  updatedAt: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const seedHooks: Record<Platform, string[]> = {
  instagram: [
    'Before/after in 15 seconds',
    'POV: You are about to fix this common mistake',
    '3 quick wins you can do today',
    'One thing I wish I knew earlier',
  ],
  tiktok: [
    'Stop scrolling and try this',
    'Watch this before you do X',
    'I tested this so you do not have to',
    'Here is the fastest way to do it',
  ],
  youtube: [
    'The 30 second breakdown you needed',
    'Do this in the next 24 hours',
    'This is the real reason it works',
    'The shortest path to the result',
  ],
  twitter: [
    'A quick thread on how to avoid this mistake',
    'Here is the one play that works',
    'A simple framework anyone can use',
    'The checklist I use every time',
  ],
  linkedin: [
    'The lesson that changed my approach',
    'A practical framework teams can use',
    'The playbook we use with clients',
    'The decision that made the difference',
  ],
  facebook: [
    'A simple breakdown anyone can follow',
    'What most people overlook about this',
    'A quick guide you can share',
    'The step-by-step approach that works',
  ],
};

let lastRefreshAt = 0;
let hooksCache: Record<Platform, TrendHook[]> | null = null;

function refreshHooks(now: number): Record<Platform, TrendHook[]> {
  const stamp = new Date(now).toISOString();
  hooksCache = Object.fromEntries(
    Object.entries(seedHooks).map(([platform, hooks]) => [
      platform,
      hooks.map((hook) => ({
        hook,
        source: 'seed',
        updatedAt: stamp,
      })),
    ]),
  ) as Record<Platform, TrendHook[]>;

  lastRefreshAt = now;
  return hooksCache;
}

export function getTrendHooks(platform: Platform): TrendHook[] {
  const now = Date.now();
  if (!hooksCache || now - lastRefreshAt > WEEK_MS) {
    refreshHooks(now);
  }

  const hooks = hooksCache?.[platform] || [];
  return hooks.map((hook) => ({ ...hook }));
}

export function forceRefreshTrendHooks(): void {
  refreshHooks(Date.now());
}

