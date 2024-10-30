import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ConfigService: ConfigService,
  ) {}
  async storeOtp(data: Prisma.OtpCreateInput) {
    // delete the existing otp with same type if exists (this is only possible if the user have not used the otp before. because upon verify the otp gets deleted)
    const existingOtp = await this.findOneByUserAndType({
      user_id: data.User.connect.id,
      type: data.type,
    });

    if (existingOtp) {
      await this.deleteOtp(existingOtp.user_id, data.type);
    }
    //store otp
    return await this.prismaService.otp.create({ data });
  }

  //find otp with user id and type
  async findOneByUserAndType(data: Prisma.OtpWhereInput) {
    return await this.prismaService.otp.findFirst({ where: data });
  }

  //delete otp by id
  async deleteOtp(id: number, type: string) {
    return await this.prismaService.otp.delete({
      where: { user_id_type: { user_id: id, type } },
    });
  }

  //verify otp
  async verifyOtp(data: VerifyOtpDto) {
    const otp = await this.prismaService.otp.findUnique({
      where: {
        user_id_type: {
          user_id: parseInt(data.user.id),
          type: data.type,
        },
      },
    });
    if (!!otp) {
      if (otp.code === data.code) {
        // check if otp is expired
        if (otp.expireAt < new Date()) {
          console.log('otp expired');
          return false;
        }
        //delete the otp after verification
        await this.deleteOtp(otp.user_id, data.type);
        return true;
      }
    }
    return false;
  }
}
