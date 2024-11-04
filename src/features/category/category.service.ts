import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Category> {
    console.log('🚀 ~ CategoryService ~ create ~:', data);

    if (data.parent_id) {
      console.log('🚀 ~ CategoryService ~ create ~ data:123', data);

      const parent = await this.prisma.category.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }
    return await this.prisma.category.create({ data });
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
