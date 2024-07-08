import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OtpType } from 'src/common/types/otpTypes';
import { SmsProvider } from 'src/common/types/smsProvider';
import { generateOtpWithMessage } from 'src/common/utils/generateOtp';
import { sendSms } from 'src/common/utils/sendSms';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.UserCreateInput) {
    const otp = await generateOtpWithMessage(OtpType.REGISTRATION);
    const smsRes = await sendSms(
      SmsProvider.BULKSMSBD,
      otp.otpMessage,
      data.phone,
    );
    // return this.prisma.user.create({ data });
    return smsRes;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
