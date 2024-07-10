import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private readonly prismaService: PrismaService) {}
  storeOtp(data: Prisma.OtpCreateInput) {
    return this.prismaService.otp.create({ data });
  }
}
