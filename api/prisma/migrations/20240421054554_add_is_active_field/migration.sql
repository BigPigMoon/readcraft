/*
  Warnings:

  - The values [BG,CS,DA,EL,ES,ET,FI,HU,IT,JA,LT,LV,MT,NL,PL,PT,RO,SK,SL,SV] on the enum `Language` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('DE', 'EN', 'FR', 'RU', 'ZH');
ALTER TABLE "Course" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TABLE "Book" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "Language_old";
COMMIT;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
