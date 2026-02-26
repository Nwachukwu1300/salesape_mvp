import prisma from '../prisma.js';

export async function runAccountDeletionWorker() {
  console.log('[account-deletion-worker] scanning for due deletion requests...');
  const now = new Date();
  const due = await prisma.accountDeletionRequest.findMany({ where: { status: 'PENDING', scheduledAt: { lte: now } } });
  for (const req of due) {
    try {
      console.log('[account-deletion-worker] processing request', req.id, 'for user', req.userId);
      const userId = req.userId;

      // Delete application data related to the user's businesses
      const businesses = await prisma.business.findMany({ where: { userId } });
      const businessIds = businesses.map(b => b.id);

      // Delete repurposed content
      await prisma.repurposedContent.deleteMany({ where: { businessId: { in: businessIds } } });
      // Delete content inputs
      await prisma.contentInput.deleteMany({ where: { businessId: { in: businessIds } } });
      // Delete website assets
      await prisma.websiteAsset.deleteMany({ where: { businessId: { in: businessIds } } });
      // Delete website versions
      await prisma.websiteVersion.deleteMany({ where: { businessId: { in: businessIds } } });

      // Delete growth settings and publishing controls
      await prisma.growthModeSettings.deleteMany({ where: { businessId: { in: businessIds } } });
      await prisma.publishingControl.deleteMany({ where: { businessId: { in: businessIds } } });

      // Delete businesses themselves (this cascades to many related items)
      await prisma.business.deleteMany({ where: { id: { in: businessIds } } });

      // Delete user-specific settings
      await prisma.userSettings.deleteMany({ where: { userId } });

      // Mark request completed and create audit log
      await prisma.accountDeletionRequest.update({ where: { id: req.id }, data: { status: 'COMPLETED' } });
      await prisma.auditLog.create({ data: { actorId: req.requestedBy, userId, action: 'COMPLETE_ACCOUNT_DELETION', details: { requestId: req.id, completedAt: new Date() } } });

      console.log('[account-deletion-worker] completed deletion for user', userId);
    } catch (err) {
      console.error('[account-deletion-worker] failed for request', req.id, err);
      // Mark CANCELLED on severe error to avoid retry storms; in production you'd add retry/backoff.
      await prisma.accountDeletionRequest.update({ where: { id: req.id }, data: { status: 'CANCELLED' } });
      await prisma.auditLog.create({ data: { actorId: 'system', userId: req.userId, action: 'ACCOUNT_DELETION_FAILED', details: { requestId: req.id, error: String(err) } } });
    }
  }
}

// Allow running as a standalone script for testing
if (require.main === module) {
  runAccountDeletionWorker().then(()=> process.exit(0)).catch((e)=> { console.error(e); process.exit(1); });
}
