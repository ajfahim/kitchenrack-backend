import { Module } from '@nestjs/common';
import { OtpModule } from 'src/features/otp/otp.module';
import { UserModule } from 'src/features/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, OtpModule],
})
export class AuthModule {}
