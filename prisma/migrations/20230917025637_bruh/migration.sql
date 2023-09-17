/*
  Warnings:

  - You are about to drop the column `epochTime` on the `Comment` table. All the data in the column will be lost.
  - The `date` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Comment_epochTime_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "epochTime",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
