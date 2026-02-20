-- Add new workflow models

-- WebsiteVersion: Store different versions of websites for rollback
CREATE TABLE "WebsiteVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WebsiteVersion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "WebsiteVersion_businessId_versionNumber_key" ON "WebsiteVersion"("businessId", "versionNumber");
CREATE INDEX "WebsiteVersion_businessId_status_idx" ON "WebsiteVersion"("businessId", "status");
CREATE INDEX "WebsiteVersion_businessId_createdAt_idx" ON "WebsiteVersion"("businessId", "createdAt");

-- WebsiteAsset: Store extracted/generated media
CREATE TABLE "WebsiteAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WebsiteAsset_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

CREATE INDEX "WebsiteAsset_businessId_type_idx" ON "WebsiteAsset"("businessId", "type");
CREATE INDEX "WebsiteAsset_businessId_source_idx" ON "WebsiteAsset"("businessId", "source");

-- ContentInput: Track user-uploaded content
CREATE TABLE "ContentInput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "url" TEXT,
    "storagePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentInput_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

CREATE INDEX "ContentInput_businessId_status_idx" ON "ContentInput"("businessId", "status");
CREATE INDEX "ContentInput_businessId_type_idx" ON "ContentInput"("businessId", "type");
CREATE INDEX "ContentInput_businessId_createdAt_idx" ON "ContentInput"("businessId", "createdAt");

-- RepurposedContent: Store repurposed outputs
CREATE TABLE "RepurposedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "contentInputId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "caption" TEXT,
    "hashtags" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RepurposedContent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE,
    CONSTRAINT "RepurposedContent_contentInputId_fkey" FOREIGN KEY ("contentInputId") REFERENCES "ContentInput" ("id") ON DELETE CASCADE
);

CREATE INDEX "RepurposedContent_businessId_platform_idx" ON "RepurposedContent"("businessId", "platform");
CREATE INDEX "RepurposedContent_businessId_status_idx" ON "RepurposedContent"("businessId", "status");
CREATE INDEX "RepurposedContent_businessId_createdAt_idx" ON "RepurposedContent"("businessId", "createdAt");
CREATE INDEX "RepurposedContent_contentInputId_idx" ON "RepurposedContent"("contentInputId");

-- PlatformDistribution: Track social media posts
CREATE TABLE "PlatformDistribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "repurposedContentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT,
    "metrics" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformDistribution_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE,
    CONSTRAINT "PlatformDistribution_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "RepurposedContent" ("id") ON DELETE CASCADE
);

CREATE INDEX "PlatformDistribution_businessId_platform_idx" ON "PlatformDistribution"("businessId", "platform");
CREATE INDEX "PlatformDistribution_businessId_createdAt_idx" ON "PlatformDistribution"("businessId", "createdAt");
CREATE INDEX "PlatformDistribution_repurposedContentId_idx" ON "PlatformDistribution"("repurposedContentId");

-- AnalyticsSnapshot: Store historical analytics data
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionSignals" INTEGER NOT NULL DEFAULT 0,
    "aiCitationFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seoImpactTrend" TEXT NOT NULL DEFAULT 'neutral',
    "aeoImpactTrend" TEXT NOT NULL DEFAULT 'neutral',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsSnapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AnalyticsSnapshot_businessId_snapshotDate_key" ON "AnalyticsSnapshot"("businessId", "snapshotDate");
CREATE INDEX "AnalyticsSnapshot_businessId_snapshotDate_idx" ON "AnalyticsSnapshot"("businessId", "snapshotDate");
CREATE INDEX "AnalyticsSnapshot_businessId_createdAt_idx" ON "AnalyticsSnapshot"("businessId", "createdAt");

-- ConnectedAccount: Store social media account tokens
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConnectedAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "ConnectedAccount_businessId_platform_accountId_key" ON "ConnectedAccount"("businessId", "platform", "accountId");
CREATE INDEX "ConnectedAccount_businessId_platform_idx" ON "ConnectedAccount"("businessId", "platform");
CREATE INDEX "ConnectedAccount_businessId_isActive_idx" ON "ConnectedAccount"("businessId", "isActive");

-- PublishingControl: Control draft/auto-publish behavior
CREATE TABLE "PublishingControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL UNIQUE,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "autoPublish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublishingControl_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

-- GrowthModeSettings: Store growth mode configuration
CREATE TABLE "GrowthModeSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL UNIQUE,
    "mode" TEXT NOT NULL DEFAULT 'BALANCED',
    "outputLimit" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GrowthModeSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);

-- BookingConfig: Store booking configuration
CREATE TABLE "BookingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL UNIQUE,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE
);
