import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private readonly prismaService: PrismaService) {}
  async storeOtp(data: Prisma.OtpCreateInput) {
    // delete the existing otp with same type if exists
    const existingOtp = await this.findOneByUserAndType({
      user_id: data.User.connect.id,
      type: data.type,
    });
    if (existingOtp) {
      await this.deleteOtp(existingOtp.id);
    }
    //store otp
    return await this.prismaService.otp.create({ data });
  }

  //find otp with user id and type
  async findOneByUserAndType(data: Prisma.OtpWhereInput) {
    return await this.prismaService.otp.findFirst({ where: data });
  }

  //delete otp by id
  async deleteOtp(id: number) {
    return await this.prismaService.otp.delete({ where: { id } });
  }
}
