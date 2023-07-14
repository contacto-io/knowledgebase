/*
  Warnings:

  - Added the required column `orgUuid` to the `KnowledgeBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `KnowledgeBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `KnowledgeBaseArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishStatus` to the `KnowledgeBaseArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `KnowledgeBaseArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `KnowledgeBaseArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `KnowledgeBaseCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `KnowledgeBaseCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `KnowledgeBaseCategorySection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `KnowledgeBaseCategorySection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable
ALTER TABLE "KnowledgeBase" ADD COLUMN     "orgUuid" UUID NOT NULL,
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "title" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "KnowledgeBaseArticle" ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "editLock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishStatus" TEXT NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "title" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "KnowledgeBaseCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "title" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "KnowledgeBaseCategorySection" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "title" SET DATA TYPE CITEXT;
