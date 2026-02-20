-- CreateEnum
CREATE TYPE "GrowthMode" AS ENUM ('CONSERVATIVE', 'BALANCED', 'AGGRESSIVE');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "growthMode" "GrowthMode" NOT NULL DEFAULT 'BALANCED';
