-- CreateTable PublicSeoAudit
CREATE TABLE "PublicSeoAudit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "performance" INTEGER NOT NULL,
    "seo" INTEGER NOT NULL,
    "mobile" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "issues" JSONB,
    "recommendations" JSONB,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicSeoAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicSeoAudit_ipAddress_createdAt_idx" ON "PublicSeoAudit"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "PublicSeoAudit_email_createdAt_idx" ON "PublicSeoAudit"("email", "createdAt");
