import { ConflictException, Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    console.log('🚀 ~ CategoryService ~ create ~ data:', data);

    try {
      if (data) {
        console.log(data.parent);
        {
          const parent = await this.prisma.category.findUnique({
            where: { id: +data.parent },
          });
          if (parent) {
            console.log(parent);
          }
        }
        return await this.prisma.category.create({ data });
      }
    } catch (error) {
      console.log('🚀 ~ CategoryService ~ create ~ error:', error);
      if (error.code === 'P2002') {
        throw new ConflictException('Category already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        child: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
