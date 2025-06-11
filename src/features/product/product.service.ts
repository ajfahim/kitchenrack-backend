import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TMeta } from 'src/common/types/apiResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto, ProductSortField, SortOrder } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { computeDisplayPrices } from './product-pricing.util';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<any> {
    try {
      // Extract categories and related entities from DTO
      const {
        categories,
        images = [],
        variants = [],
        attributes = [],
        ...productData
      } = createProductDto;

      // Check for existing product with same slug or SKU
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          OR: [
            { slug: productData.slug },
            productData.sku ? { sku: productData.sku } : undefined,
          ].filter(Boolean),
        },
      });

      if (existingProduct) {
        return {
          statusCode: 409,
          success: false,
          message: existingProduct.slug === productData.slug
            ? `A product with slug '${productData.slug}' already exists`
            : `A product with SKU '${productData.sku}' already exists`,
          error: existingProduct.slug === productData.slug
            ? 'DUPLICATE_SLUG'
            : 'DUPLICATE_SKU',
          data: null
        };
      }

      // Check if categories exist
      const categoryCount = await this.prisma.category.count({
        where: {
          id: {
            in: categories,
          },
        },
      });

      if (categoryCount !== categories.length) {
        return {
          statusCode: 400,
          success: false,
          message: 'One or more categories do not exist',
          error: 'INVALID_CATEGORY',
          data: null
        };
      }

      // Create product with all related entities in a transaction
      const newProduct = await this.prisma.$transaction(async (tx) => {
        // Create the base product
        const product = await tx.product.create({
          data: {
            ...productData,
            has_variants: variants && variants.length > 0 ? true : false,
            // Connect categories
            categories: {
              connect: categories.map(id => ({ id })),
            },
          },
        });

        // Create product images if any
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map(image => ({
              ...image,
              product_id: product.id,
            })),
          });
        }

        // Create product variants if any
        if (variants.length > 0) {
          for (const variant of variants) {
            await tx.productVariant.create({
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                sale_price: variant.sale_price,
                stock: variant.stock || 0,
                product: {
                  connect: { id: product.id }
                }
              },
            });
          }
        }

        // Create product attributes if any
        if (attributes.length > 0) {
          await tx.productAttribute.createMany({
            data: attributes.map(attr => ({
              name: attr.name,
              value: attr.value,
              product_id: product.id,
            })),
            skipDuplicates: true,
          });
        }

        // Return the product with all relations
        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            categories: true,
            images: true,
            variants: true,
            attributes: true,
          },
        });
      });

      return {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      };
    } catch (error) {
      console.error('Error creating product:', error);

      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            statusCode: 409,
            success: false,
            message: 'A product with the same unique identifier already exists',
            error: 'DUPLICATE_PRODUCT',
            data: null
          };
        }
      }

      // Generic error handling
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to create product',
        error: 'INTERNAL_SERVER_ERROR',
        data: null
      };
    }
  }

  async findAll(filterDto: ProductFilterDto): Promise<any> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category_id,
        min_price,
        max_price,
        featured,
        status,
        brand,
        sort_by = ProductSortField.CREATED_AT,
        sort_order = SortOrder.DESC,
      } = filterDto;

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build where conditions (excluding price for now)
      const where: Prisma.ProductWhereInput = {};

      // Search in name or description
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category_id) {
        where.categories = {
          some: { id: category_id },
        };
      }

      if (featured !== undefined) {
        where.featured = featured;
      }

      if (status) {
        where.status = status;
      }

      if (brand) {
        where.brand = brand;
      }

      // Fetch all products matching non-price filters, including variants
      const products = await this.prisma.product.findMany({
        where,
        include: {
          categories: true,
          images: true,
          variants: true,
          attributes: true,
        },
      });

      // Compute display_price and display_sale_price for each product
      let productsWithDisplayPrice = products.map(product => {
        const { display_price, display_sale_price } = computeDisplayPrices(product);
        return {
          ...product,
          display_price,
          display_sale_price,
        };
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Products retrieved successfully',
        meta: {
          total: products.length,
          page,
          limit,
        },
        data: productsWithDisplayPrice,
      };
    } catch (error) {
      console.error('Error retrieving products:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to retrieve products',
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          categories: true,
          images: {
            orderBy: {
              display_order: 'asc',
            },
          },
          variants: true,
          attributes: true,
        },
      });

      if (!product) {
        return {
          statusCode: 404,
          success: false,
          message: `Product with ID ${id} not found`,
          error: 'PRODUCT_NOT_FOUND',
          data: null,
        };
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      console.error(`Error retrieving product with ID ${id}:`, error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to retrieve product',
        error: 'INTERNAL_SERVER_ERROR',
        data: null,
      };
    }
  }

  async findBySlug(slug: string): Promise<any> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          categories: true,
          images: {
            orderBy: {
              display_order: 'asc',
            },
          },
          variants: true,
          attributes: true,
        },
      });

      if (!product) {
        return {
          statusCode: 404,
          success: false,
          message: `Product with slug "${slug}" not found`,
          error: 'PRODUCT_NOT_FOUND',
          data: null,
        };
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      console.error(`Error retrieving product with slug ${slug}:`, error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to retrieve product',
        error: 'INTERNAL_SERVER_ERROR',
        data: null,
      };
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<any> {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
        include: {
          categories: true,
        },
      });

      if (!existingProduct) {
        return {
          statusCode: 404,
          success: false,
          message: `Product with ID ${id} not found`,
          error: 'PRODUCT_NOT_FOUND',
          data: null,
        };
      }

      // Extract categories and related entities from DTO
      const {
        categories,
        images,
        variants,
        attributes,
        deletedImageIds, // Extract this field explicitly
        ...productData
      } = updateProductDto;

      console.log(updateProductDto);

      // Check for slug or SKU uniqueness if they're being updated
      if (productData.slug || productData.sku) {
        const duplicateCheck = await this.prisma.product.findFirst({
          where: {
            id: { not: id },
            OR: [
              productData.slug ? { slug: productData.slug } : undefined,
              productData.sku ? { sku: productData.sku } : undefined,
            ].filter(Boolean),
          },
        });

        if (duplicateCheck) {
          return {
            statusCode: 409,
            success: false,
            message: duplicateCheck.slug === productData.slug
              ? `A product with slug '${productData.slug}' already exists`
              : `A product with SKU '${productData.sku}' already exists`,
            error: duplicateCheck.slug === productData.slug
              ? 'DUPLICATE_SLUG'
              : 'DUPLICATE_SKU',
            data: null
          };
        }
      }

      // Check if categories exist if they're being updated
      if (categories && categories.length > 0) {
        const categoryCount = await this.prisma.category.count({
          where: {
            id: {
              in: categories,
            },
          },
        });

        if (categoryCount !== categories.length) {
          return {
            statusCode: 400,
            success: false,
            message: 'One or more categories do not exist',
            error: 'INVALID_CATEGORY',
            data: null
          };
        }
      }

      // Update product with all related entities in a transaction
      const updatedProduct = await this.prisma.$transaction(async (tx) => {
        // Update the base product
        const product = await tx.product.update({
          where: { id },
          data: {
            ...productData,
            // Update has_variants flag based on provided variants
            has_variants: variants && variants.length > 0 ? true : false,
            // Update categories if provided
            ...(categories && {
              categories: {
                // First disconnect all existing categories
                disconnect: existingProduct.categories.map(cat => ({ id: cat.id })),
                // Then connect the new ones
                connect: categories.map(id => ({ id })),
              },
            }),
          },
        });

        // Handle product images if provided
        if ((images && images.length > 0) || (deletedImageIds && deletedImageIds.length > 0)) {
          // If specific image IDs are provided for deletion
          if (deletedImageIds && deletedImageIds.length > 0) {
            // Delete only the specified images
            await tx.productImage.deleteMany({
              where: {
                id: { in: deletedImageIds },
                product_id: id
              },
            });
          } else if (images && images.length > 0) {
            // If no specific deletion IDs but new images provided, delete all existing
            await tx.productImage.deleteMany({
              where: { product_id: id },
            });
          }

          // Add new images if provided
          if (images && images.length > 0) {
            await tx.productImage.createMany({
              data: images.map(image => ({
                ...image,
                product_id: product.id,
              })),
            });
          }
        }

        // Handle product variants if provided
        if (variants && variants.length > 0) {
          // Delete existing variants
          await tx.productVariant.deleteMany({
            where: { product_id: id },
          });

          // Create new variants
          for (const variant of variants) {
            await tx.productVariant.create({
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                sale_price: variant.sale_price,
                stock: variant.stock || 0,
                product: {
                  connect: { id: product.id }
                }
              },
            });
          }
        }

        // Handle product attributes if provided
        if (attributes && attributes.length > 0) {
          // Delete existing attributes
          await tx.productAttribute.deleteMany({
            where: { product_id: id },
          });

          // Create new attributes
          await tx.productAttribute.createMany({
            data: attributes.map(attr => ({
              name: attr.name,
              value: attr.value,
              product_id: product.id,
            })),
            skipDuplicates: true,
          });
        }

        // Return the updated product with all relations
        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            categories: true,
            images: true,
            variants: true,
            attributes: true,
          },
        });
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);

      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            statusCode: 409,
            success: false,
            message: 'A product with the same unique identifier already exists',
            error: 'DUPLICATE_PRODUCT',
            data: null
          };
        }
      }

      // Generic error handling
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to update product',
        error: 'INTERNAL_SERVER_ERROR',
        data: null
      };
    }
  }

  async remove(id: number): Promise<any> {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return {
          statusCode: 404,
          success: false,
          message: `Product with ID ${id} not found`,
          error: 'PRODUCT_NOT_FOUND',
          data: null,
        };
      }

      // Delete product and related entities in a transaction
      await this.prisma.$transaction([
        this.prisma.productImage.deleteMany({
          where: { product_id: id },
        }),
        this.prisma.productVariant.deleteMany({
          where: { product_id: id },
        }),
        this.prisma.productAttribute.deleteMany({
          where: { product_id: id },
        }),
        this.prisma.product.delete({
          where: { id },
        }),
      ]);

      return {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);

      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return {
            statusCode: 400,
            success: false,
            message: 'Cannot delete product because it is referenced by other records',
            error: 'REFERENCE_CONSTRAINT',
            data: null
          };
        }
      }

      // Generic error handling
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete product',
        error: 'INTERNAL_SERVER_ERROR',
        data: null
      };
    }
  }
}
