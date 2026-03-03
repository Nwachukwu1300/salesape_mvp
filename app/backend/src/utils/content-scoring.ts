import type { Platform } from '../types/workflow.types.js';

export type ScoreWeights = {
  hookStrength: number;
  pacing: number;
  clarity: number;
  platformFit: number;
  novelty: number;
};

export type ScoreBreakdown = {
  hookStrength: number;
  pacing: number;
  clarity: number;
  platformFit: number;
  novelty: number;
  weightedScore: number;
};

const DEFAULT_WEIGHTS: Record<Platform, ScoreWeights> = {
  instagram: { hookStrength: 0.25, pacing: 0.2, clarity: 0.2, platformFit: 0.2, novelty: 0.15 },
  tiktok: { hookStrength: 0.3, pacing: 0.25, clarity: 0.15, platformFit: 0.2, novelty: 0.1 },
  youtube: { hookStrength: 0.25, pacing: 0.2, clarity: 0.25, platformFit: 0.2, novelty: 0.1 },
  twitter: { hookStrength: 0.25, pacing: 0.15, clarity: 0.3, platformFit: 0.2, novelty: 0.1 },
  linkedin: { hookStrength: 0.2, pacing: 0.15, clarity: 0.35, platformFit: 0.2, novelty: 0.1 },
  facebook: { hookStrength: 0.25, pacing: 0.2, clarity: 0.25, platformFit: 0.2, novelty: 0.1 },
};

const POWER_WORDS = [
  'secret',
  'hack',
  'trick',
  'reveal',
  'discover',
  'unlock',
  'proven',
  'research',
  'breakthrough',
  'data',
  'fast',
  'simple',
  'easy',
  'mistake',
];

export function getDefaultScoreWeights(platform: Platform): ScoreWeights {
  return DEFAULT_WEIGHTS[platform] || DEFAULT_WEIGHTS.instagram;
}

export function calculateHookStrength(hook: string): number {
  if (!hook) return 40;
  let score = 45;
  const text = hook.toLowerCase();
  const powerMatches = POWER_WORDS.filter((w) => text.includes(w)).length;
  score += powerMatches * 6;
  if (text.includes('?')) score += 10;
  if (/\d/.test(text)) score += 6;
  if (hook.length >= 12 && hook.length <= 50) score += 10;
  if (hook.length > 80) score -= 8;
  return clampScore(score);
}

export function calculatePacing(script: string, durationSeconds: number, platform: Platform): number {
  if (!script || !durationSeconds) return 50;
  const words = script.trim().split(/\s+/).length;
  const wps = words / Math.max(durationSeconds, 1);

  const target = platform === 'tiktok' ? 2.6 : platform === 'instagram' ? 2.3 : platform === 'youtube' ? 2.1 : 2.0;
  const diff = Math.abs(wps - target);
  const score = 90 - diff * 20;
  return clampScore(score);
}

export function calculateClarity(script: string): number {
  if (!script) return 50;
  const words = script.split(/\s+/);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);

  let score = 80;
  score -= Math.min(Math.abs(avgWordLength - 4.5) * 6, 20);
  score -= Math.min(Math.abs(avgSentenceLength - 12) * 1.5, 20);
  return clampScore(score);
}

export function calculatePlatformFit(
  platform: Platform,
  hook: string,
  caption: string,
  hashtags: string[] = [],
): number {
  let score = 60;
  const text = `${hook} ${caption}`.toLowerCase();
  if (platform === 'tiktok') {
    if (hashtags.some((h) => h.toLowerCase().includes('#fyp'))) score += 10;
    if (hook.length < 45) score += 8;
  }
  if (platform === 'instagram') {
    if (hashtags.some((h) => h.toLowerCase().includes('#reels'))) score += 10;
    if (caption.length > 80) score += 6;
  }
  if (platform === 'youtube') {
    if (text.includes('subscribe')) score += 8;
    if (hook.length < 60) score += 6;
  }
  if (platform === 'linkedin') {
    if (caption.length > 120) score += 10;
    if (text.includes('lesson') || text.includes('framework')) score += 6;
  }
  return clampScore(score);
}

export function calculateNovelty(script: string): number {
  if (!script) return 40;
  const words = script.toLowerCase().split(/\s+/).filter(Boolean);
  const unique = new Set(words);
  const uniqueness = unique.size / Math.max(words.length, 1);
  const score = 40 + Math.min(uniqueness * 80, 40);
  return clampScore(score);
}

export function calculateWeightedScore(breakdown: Omit<ScoreBreakdown, 'weightedScore'>, weights: ScoreWeights): number {
  const weightedScore =
    breakdown.hookStrength * weights.hookStrength +
    breakdown.pacing * weights.pacing +
    breakdown.clarity * weights.clarity +
    breakdown.platformFit * weights.platformFit +
    breakdown.novelty * weights.novelty;
  return clampScore(weightedScore);
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

