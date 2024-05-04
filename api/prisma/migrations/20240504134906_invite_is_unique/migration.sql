/*
  Warnings:

  - A unique constraint covering the columns `[inviteLink]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inviteCode]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_inviteLink_key" ON "Course"("inviteLink");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_inviteCode_key" ON "Folder"("inviteCode");
