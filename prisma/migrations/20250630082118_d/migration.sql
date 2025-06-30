-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
