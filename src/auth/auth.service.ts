import { Injectable } from '@nestjs/common';
import { OtpType } from 'src/common/types/otpTypes';
import { SmsProvider } from 'src/common/types/smsProvider';
import { generateOtpWithMessage } from 'src/common/utils/generateOtp';
import { sendSms } from 'src/common/utils/sendSms';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import { RegistrationDto } from './dto/registration-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}
  async registration(data: RegistrationDto) {
    //create user
    const user = await this.userService.create(data);
    // generate otp
    const otpMessage = generateOtpWithMessage(OtpType.REGISTRATION);
    // send otp sms
    const { otpCode, expireAt, otpMessage: message } = otpMessage;
    await sendSms(SmsProvider.BULKSMSBD, message, data.phone);
    // store otp in db
    const otp = await this.otpService.storeOtp({
      code: otpCode,
      expireAt,
      User: { connect: { id: user.id } },
    });

    return otp;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
