/*
  Warnings:

  - You are about to drop the column `auth_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_verified` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_auth_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "auth_id",
DROP COLUMN "otp_verified";
