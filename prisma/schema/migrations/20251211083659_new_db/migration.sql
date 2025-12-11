/*
  Warnings:

  - Made the column `receiverId` on table `TravelRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TravelRequest" DROP CONSTRAINT "TravelRequest_receiverId_fkey";

-- AlterTable
ALTER TABLE "TravelRequest" ALTER COLUMN "receiverId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TravelRequest" ADD CONSTRAINT "TravelRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
