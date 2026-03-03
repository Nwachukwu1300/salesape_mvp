/*
  Warnings:

  - You are about to drop the column `generationStatus` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `generationStep` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `growthMode` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `imageAssets` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `websiteConfig` on the `Business` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AnalyticsSnapshot" DROP CONSTRAINT "AnalyticsSnapshot_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ApprovalHistory" DROP CONSTRAINT "ApprovalHistory_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "ApprovalHistory" DROP CONSTRAINT "ApprovalHistory_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ApprovalHistory" DROP CONSTRAINT "ApprovalHistory_repurposedContentId_fkey";

-- DropForeignKey
ALTER TABLE "BookingConfig" DROP CONSTRAINT "BookingConfig_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ContentInput" DROP CONSTRAINT "ContentInput_businessId_fkey";

-- DropForeignKey
ALTER TABLE "GrowthModeSettings" DROP CONSTRAINT "GrowthModeSettings_businessId_fkey";

-- DropForeignKey
ALTER TABLE "PlatformDistribution" DROP CONSTRAINT "PlatformDistribution_businessId_fkey";

-- DropForeignKey
ALTER TABLE "PlatformDistribution" DROP CONSTRAINT "PlatformDistribution_repurposedContentId_fkey";

-- DropForeignKey
ALTER TABLE "PublishingControl" DROP CONSTRAINT "PublishingControl_businessId_fkey";

-- DropForeignKey
ALTER TABLE "RepurposedContent" DROP CONSTRAINT "RepurposedContent_businessId_fkey";

-- DropForeignKey
ALTER TABLE "RepurposedContent" DROP CONSTRAINT "RepurposedContent_contentInputId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledPost" DROP CONSTRAINT "ScheduledPost_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledPost" DROP CONSTRAINT "ScheduledPost_repurposedContentId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteAsset" DROP CONSTRAINT "WebsiteAsset_businessId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteVersion" DROP CONSTRAINT "WebsiteVersion_businessId_fkey";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "generationStatus",
DROP COLUMN "generationStep",
DROP COLUMN "growthMode",
DROP COLUMN "imageAssets",
DROP COLUMN "templateId",
DROP COLUMN "websiteConfig",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "hours" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "GrowthMode";

-- CreateTable
CREATE TABLE "VisitLog" (
    "ipDate" TEXT NOT NULL,
    "clientIp" TEXT NOT NULL,
    "visitDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("ipDate")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "topK" INTEGER NOT NULL DEFAULT 5,
    "ttlDays" INTEGER NOT NULL DEFAULT 30,
    "twoFA" BOOLEAN NOT NULL DEFAULT false,
    "growthMode" TEXT NOT NULL DEFAULT 'BALANCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitLog_clientIp_visitDate_idx" ON "VisitLog"("clientIp", "visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "WebsiteVersion" ADD CONSTRAINT "WebsiteVersion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteAsset" ADD CONSTRAINT "WebsiteAsset_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentInput" ADD CONSTRAINT "ContentInput_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepurposedContent" ADD CONSTRAINT "RepurposedContent_contentInputId_fkey" FOREIGN KEY ("contentInputId") REFERENCES "ContentInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepurposedContent" ADD CONSTRAINT "RepurposedContent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformDistribution" ADD CONSTRAINT "PlatformDistribution_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformDistribution" ADD CONSTRAINT "PlatformDistribution_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "AnalyticsSnapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingControl" ADD CONSTRAINT "PublishingControl_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthModeSettings" ADD CONSTRAINT "GrowthModeSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingConfig" ADD CONSTRAINT "BookingConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
