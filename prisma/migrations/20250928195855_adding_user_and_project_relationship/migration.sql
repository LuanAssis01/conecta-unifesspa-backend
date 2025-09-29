/*
  Warnings:

  - You are about to drop the column `projectId` on the `Keywords` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Keywords" DROP CONSTRAINT "Keywords_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."Keywords" DROP COLUMN "projectId",
ADD COLUMN     "projectid" INTEGER;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "creatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Keywords" ADD CONSTRAINT "Keywords_projectid_fkey" FOREIGN KEY ("projectid") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
