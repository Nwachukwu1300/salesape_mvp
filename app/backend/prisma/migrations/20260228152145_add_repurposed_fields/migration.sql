-- AlterTable
ALTER TABLE "RepurposedContent" ADD COLUMN     "assetPath" TEXT,
ADD COLUMN     "assetUrl" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "performance" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "scoreBreakdown" JSONB,
ADD COLUMN     "trendHooks" JSONB;
