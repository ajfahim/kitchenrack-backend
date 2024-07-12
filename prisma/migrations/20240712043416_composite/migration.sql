/*
  Warnings:

  - The primary key for the `Otp` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_pkey",
ADD CONSTRAINT "Otp_pkey" PRIMARY KEY ("user_id", "type");
