/*
  Warnings:

  - The primary key for the `_CategoryToProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_CategoryToProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");
