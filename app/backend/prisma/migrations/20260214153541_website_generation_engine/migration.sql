-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "generationStatus" TEXT NOT NULL DEFAULT 'idle',
ADD COLUMN     "generationStep" TEXT,
ADD COLUMN     "imageAssets" JSONB,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "websiteConfig" JSONB;

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientTitle" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
