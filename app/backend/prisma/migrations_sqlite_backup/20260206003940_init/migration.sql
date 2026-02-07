/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN "businessUnderstanding" JSONB;
ALTER TABLE "Business" ADD COLUMN "calendlyApiKey" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "SeoAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "accessibilityScore" INTEGER NOT NULL,
    "bestPracticesScore" INTEGER NOT NULL,
    "criticalIssues" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "opportunities" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "rawAuditData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeoAudit_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebsiteGenerationConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "sections" JSONB NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroSubtext" TEXT NOT NULL,
    "services" JSONB NOT NULL,
    "aboutContent" TEXT NOT NULL,
    "leadFormFields" JSONB NOT NULL,
    "bookingProvider" TEXT NOT NULL,
    "bookingCalendarId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WebsiteGenerationConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "extractedData" JSONB,
    "extractedBusinessName" TEXT,
    "extractedIndustry" TEXT,
    "extractedServices" JSONB NOT NULL,
    "extractedLocation" TEXT,
    "extractedBrandTone" TEXT,
    "websiteUrlProvided" TEXT,
    "instagramUrlProvided" TEXT,
    "websiteScrapedData" JSONB,
    "instagramScrapedData" JSONB,
    "stage" TEXT NOT NULL DEFAULT 'initial',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingConversation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "leadId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("businessId", "createdAt", "email", "id", "name", "status") SELECT "businessId", "createdAt", "email", "id", "name", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_businessId_startTime_endTime_key" ON "Booking"("businessId", "startTime", "endTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteGenerationConfig_businessId_key" ON "WebsiteGenerationConfig"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteGenerationConfig_slug_key" ON "WebsiteGenerationConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingConversation_sessionId_key" ON "OnboardingConversation"("sessionId");
