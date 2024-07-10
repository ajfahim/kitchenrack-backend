import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.UserCreateInput) {
    const existingPhone = await this.findOneByPhone(data.phone);

    if (existingPhone)
      throw new ConflictException('Phone number already registered');

    const existingEmail = await this.findOneByEmail(data.email);

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    return this.prisma.user.create({ data });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOneById(id: number) {
    return `This action returns a #${id} user`;
  }

  async findOneByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: {
        phone,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
