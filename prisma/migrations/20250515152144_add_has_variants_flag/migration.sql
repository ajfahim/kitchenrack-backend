-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "has_variants" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToProduct_AB_unique";
