/*
  Warnings:

  - You are about to drop the column `projectId` on the `Keyword` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Keyword" DROP CONSTRAINT "Keyword_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."Keyword" DROP COLUMN "projectId";

-- CreateTable
CREATE TABLE "public"."_ProjectKeywords" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectKeywords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectKeywords_B_index" ON "public"."_ProjectKeywords"("B");

-- AddForeignKey
ALTER TABLE "public"."_ProjectKeywords" ADD CONSTRAINT "_ProjectKeywords_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectKeywords" ADD CONSTRAINT "_ProjectKeywords_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
