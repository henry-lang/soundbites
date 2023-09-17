/*
  Warnings:

  - You are about to drop the column `epochTime` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "epochTime",
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
