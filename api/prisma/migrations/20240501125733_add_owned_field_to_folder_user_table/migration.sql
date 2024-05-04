/*
  Warnings:

  - Added the required column `owned` to the `FolderUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FolderUser" ADD COLUMN     "owned" BOOLEAN NOT NULL;
