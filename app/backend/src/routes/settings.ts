
// Helper: ensure token was issued recently (minutes)
function recentAuth(req: any, minutes = 15) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];
    if (!token) return false;
    const decoded: any = require('jsonwebtoken').decode(token);
    if (!decoded) return false;
    const iat = decoded.iat || decoded.iat_seconds || decoded.auth_time;
    if (!iat) return false;
    const issued = new Date(iat * (iat>1000000000?1000:1));
    const ageMs = Date.now() - issued.getTime();
    return ageMs <= minutes * 60 * 1000;
  } catch (err) {
    return false;
  }
}

// Simple in-memory rate limiter per user for danger endpoints
const dangerRateMap: Record<string, {count:number, ts:number}> = {};
function checkRateLimit(userId: string, limit = 3, windowMinutes = 10) {
  const now = Date.now();
  const rec = dangerRateMap[userId] || { count: 0, ts: now };
  if (now - rec.ts > windowMinutes * 60 * 1000) {
    rec.count = 1; rec.ts = now; dangerRateMap[userId] = rec; return true;
  }
  if (rec.count >= limit) return false;
  rec.count += 1; dangerRateMap[userId] = rec; return true;
}

import express, { type Request, type Response } from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Use authenticateToken middleware in index.ts when mounting this router so req.userId is available

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) return res.json({});
    return res.json(settings);
  } catch (err: any) {
    console.error('GET /api/settings error', err);
    return res.status(500).json({ error: err?.message || 'unknown' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { memoryEnabled, topK, ttlDays, twoFA, growthMode } = req.body || {};

    const upserted = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        memoryEnabled: !!memoryEnabled,
        topK: Number(topK) || 5,
        ttlDays: Number(ttlDays) || 30,
        twoFA: !!twoFA,
        growthMode: growthMode || 'BALANCED',
      },
      update: {
        memoryEnabled: !!memoryEnabled,
        topK: Number(topK) || 5,
        ttlDays: Number(ttlDays) || 30,
        twoFA: !!twoFA,
        growthMode: growthMode || 'BALANCED',
      },
    });

    // Audit
    await prisma.auditLog.create({ data: { actorId: userId, userId, action: 'UPDATE_SETTINGS', details: { payload: req.body } } });

    return res.json({ status: 'ok', settings: upserted });
  } catch (err: any) {
    console.error('POST /api/settings error', err);
    return res.status(500).json({ error: err?.message || 'unknown' });
  }
});

// Danger zone: schedule delete content (production behavior: actually delete app-owned content)
router.post('/delete-content', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // In production, add re-auth checks / admin checks here
    // Rate limit
    if (!checkRateLimit(userId)) return res.status(429).json({ error: 'Rate limit exceeded for danger endpoints' });
    // Require recent auth (issued within last 15 minutes)
    if (!recentAuth(req, 15)) return res.status(403).json({ error: 'Recent re-authentication required' });
    // Delete application-owned content: example deletes repurposed content and content inputs for user's businesses
    const businesses = await prisma.business.findMany({ where: { userId } });
    const businessIds = businesses.map((b) => b.id);

    // delete repurposed content
    const deletedRepurposed = await prisma.repurposedContent.deleteMany({ where: { businessId: { in: businessIds } } });
    // delete content inputs
    const deletedInputs = await prisma.contentInput.deleteMany({ where: { businessId: { in: businessIds } } });

    // log audit
    await prisma.auditLog.create({ data: { actorId: userId, userId, action: 'DELETE_CONTENT', details: { deletedRepurposed: deletedRepurposed.count, deletedInputs: deletedInputs.count } } });

    return res.json({ status: 'deleted_content', deletedRepurposed: deletedRepurposed.count, deletedInputs: deletedInputs.count });
  } catch (err: any) {
    console.error('POST /api/settings/delete-content error', err);
    return res.status(500).json({ error: err?.message || 'unknown' });
  }
});

// Danger zone: schedule account deletion (creates a pending deletion request, does NOT delete auth provider)
router.post('/delete-account', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { typedConfirmation } = req.body || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Require typed confirmation
    if (String(typedConfirmation || '').trim() !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ error: 'Typed confirmation mismatch. Type "DELETE MY ACCOUNT" to confirm.' });
    }

    // Rate limit
    if (!checkRateLimit(userId)) return res.status(429).json({ error: 'Rate limit exceeded for danger endpoints' });

    // Require recent auth (issued within last 15 minutes)
    if (!recentAuth(req, 15)) return res.status(403).json({ error: 'Recent re-authentication required' });

    // Schedule deletion for 14 days from now
    const scheduledAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const reqRec = await prisma.accountDeletionRequest.create({ data: { userId, requestedBy: userId, scheduledAt } });

    await prisma.auditLog.create({ data: { actorId: userId, userId, action: 'SCHEDULE_ACCOUNT_DELETION', details: { scheduledAt } } });

    return res.json({ status: 'scheduled', scheduledAt });
  } catch (err: any) {
    console.error('POST /api/settings/delete-account error', err);
    return res.status(500).json({ error: err?.message || 'unknown' });
  }
});

export default router;
