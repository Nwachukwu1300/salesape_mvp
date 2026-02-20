-- Phase 4: Add Scheduling and Approval Workflow Models

-- ScheduledPost: Track scheduled content publishing
CREATE TABLE "ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "repurposedContentId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScheduledPost_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE,
    CONSTRAINT "ScheduledPost_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent" ("id") ON DELETE CASCADE
);

CREATE INDEX "ScheduledPost_businessId_status_idx" ON "ScheduledPost"("businessId", "status");
CREATE INDEX "ScheduledPost_businessId_scheduledFor_idx" ON "ScheduledPost"("businessId", "scheduledFor");
CREATE INDEX "ScheduledPost_repurposedContentId_idx" ON "ScheduledPost"("repurposedContentId");
CREATE INDEX "ScheduledPost_status_scheduledFor_idx" ON "ScheduledPost"("status", "scheduledFor");

-- ApprovalHistory: Track approval workflow actions and audit trail
CREATE TABLE "ApprovalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "repurposedContentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "approvedBy" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE,
    CONSTRAINT "ApprovalHistory_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent" ("id") ON DELETE CASCADE,
    CONSTRAINT "ApprovalHistory_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL
);

CREATE INDEX "ApprovalHistory_businessId_repurposedContentId_idx" ON "ApprovalHistory"("businessId", "repurposedContentId");
CREATE INDEX "ApprovalHistory_businessId_createdAt_idx" ON "ApprovalHistory"("businessId", "createdAt");
CREATE INDEX "ApprovalHistory_repurposedContentId_idx" ON "ApprovalHistory"("repurposedContentId");
