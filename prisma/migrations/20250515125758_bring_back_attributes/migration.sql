/*
  Warnings:

  - Added the required column `attributes` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "attributes" JSONB NOT NULL;
