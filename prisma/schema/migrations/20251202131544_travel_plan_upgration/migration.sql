/*
  Warnings:

  - You are about to drop the column `budgetMax` on the `TravelPlans` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMin` on the `TravelPlans` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TravelPlans` table. All the data in the column will be lost.
  - The `visibility` column on the `TravelPlans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "TravelPlans" DROP COLUMN "budgetMax",
DROP COLUMN "budgetMin",
DROP COLUMN "description",
ADD COLUMN     "budgetRange" TEXT,
ADD COLUMN     "itinerary" TEXT,
DROP COLUMN "visibility",
ADD COLUMN     "visibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC';
