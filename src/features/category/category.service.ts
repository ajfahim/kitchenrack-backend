import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a slug from a string
   * @param text The text to generate a slug from
   * @returns A slug string
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
  }

  async create(data: CreateCategoryDto): Promise<any> {
    console.log('🚀 ~ CategoryService ~ create ~:', data);

    try {
      // Transform the data before creating the category
      const createData: any = {
        name: data.name,
        slug: data.slug || this.generateSlug(data.name),
        description: data.description,
        icon: data.icon,
        banner_image: data.banner_image
      };

      // If parent_id exists, use connect syntax instead of direct assignment
      if (data.parent_id) {
        console.log('🚀 ~ CategoryService ~ create ~ data:123', data);

        const parent = await this.prisma.category.findUnique({
          where: { id: data.parent_id },
        });
        if (!parent) {
          return {
            statusCode: 404,
            success: false,
            message: 'Parent category not found',
            error: 'NOT_FOUND'
          };
        }
        
        // Use the proper Prisma relation syntax
        createData.parent = {
          connect: { id: data.parent_id }
        };
      }
      
      const newCategory = await this.prisma.category.create({ 
        data: createData 
      });

      return {
        statusCode: 201,
        success: true,
        message: 'Category created successfully',
        data: newCategory
      };
    } catch (error) {
      console.error('Error creating category:', error);
      
      // Handle Prisma specific errors
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('name')) {
          return {
            statusCode: 409,
            success: false,
            message: `A category with the name '${data.name}' already exists`,
            error: 'DUPLICATE_CATEGORY_NAME'
          };
        }
        
        if (error.meta?.target?.includes('slug')) {
          return {
            statusCode: 409,
            success: false,
            message: `A category with the slug '${data.slug || this.generateSlug(data.name)}' already exists`,
            error: 'DUPLICATE_CATEGORY_SLUG'
          };
        }
      }
      
      // Handle other Prisma errors
      if (error.code?.startsWith('P')) {
        return {
          statusCode: 400,
          success: false,
          message: error.message || 'Database error occurred',
          error: error.code
        };
      }
      
      // Generic error handling
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to create category',
        error: 'INTERNAL_SERVER_ERROR'
      };
    }
  }

  async findAll(): Promise<any> {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          child: true,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to retrieve categories',
        data: null
      };
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          child: true,
        },
      });

      if (!category) {
        return {
          statusCode: 404,
          success: false,
          message: `Category with id ${id} not found`,
          data: null
        };
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Category retrieved successfully',
        data: category
      };
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to retrieve category',
        data: null
      };
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        return {
          statusCode: 404,
          success: false,
          message: `Category with id ${id} not found`,
          data: null
        };
      }

      // Transform data if needed (similar to create method)
      const updateData: any = { ...updateCategoryDto };
      
      // Generate slug from name if name is updated and slug isn't provided
      if (updateCategoryDto.name && !updateCategoryDto.slug) {
        updateData.slug = this.generateSlug(updateCategoryDto.name);
      }
      
      // Handle parent_id if it exists
      if (updateCategoryDto.parent_id) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parent_id },
        });
        
        if (!parent) {
          return {
            statusCode: 404,
            success: false,
            message: 'Parent category not found',
            error: 'NOT_FOUND'
          };
        }
        
        // Use proper Prisma relation syntax
        delete updateData.parent_id;
        updateData.parent = {
          connect: { id: updateCategoryDto.parent_id }
        };
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateData,
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      };
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('name')) {
          return {
            statusCode: 409,
            success: false,
            message: `A category with this name already exists`,
            error: 'DUPLICATE_CATEGORY_NAME'
          };
        }
        
        if (error.meta?.target?.includes('slug')) {
          return {
            statusCode: 409,
            success: false,
            message: `A category with this slug already exists`,
            error: 'DUPLICATE_CATEGORY_SLUG'
          };
        }
      }
      
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to update category',
        data: null
      };
    }
  }

  async remove(id: number): Promise<any> {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
        include: { child: true }
      });

      if (!existingCategory) {
        return {
          statusCode: 404,
          success: false,
          message: `Category with id ${id} not found`,
          data: null
        };
      }

      // Check if category has children
      if (existingCategory.child && existingCategory.child.length > 0) {
        return {
          statusCode: 400,
          success: false,
          message: 'Cannot delete category with subcategories. Delete subcategories first.',
          error: 'HAS_SUBCATEGORIES'
        };
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Category deleted successfully',
        data: null
      };
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      
      // Handle foreign key constraint violations
      if (error.code === 'P2003') {
        return {
          statusCode: 400,
          success: false,
          message: 'Cannot delete category because it is referenced by other records',
          error: 'FOREIGN_KEY_CONSTRAINT'
        };
      }
      
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete category',
        data: null
      };
    }
  }
}
