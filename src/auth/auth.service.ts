import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpType } from 'src/common/types/otpTypes';
import { generateOtpWithMessage } from 'src/common/utils/generateOtp';
import { generateToken } from 'src/common/utils/jwtTokens';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}
  async registration(data: RegistrationDto) {
    //create user
    const user = await this.userService.create(data);
    // generate otp
    const otpMessage = generateOtpWithMessage(OtpType.REGISTRATION);
    // send otp sms
    const { otpCode, expireAt, otpMessage: message } = otpMessage;
    //FIXME: Uncomment this
    // await sendSms(SmsProvider.BULKSMSBD, message, data.phone);

    // store otp in db
    const otp = await this.otpService.storeOtp({
      code: otpCode,
      expireAt,
      type: OtpType.REGISTRATION,
      User: { connect: { id: user.id } },
    });

    return { success: true, message: 'OTP sent', data: user };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const verified = await this.otpService.verifyOtp(data);
    console.log('🚀 ~ AuthService ~ verifyOtp ~ verified:', verified);
    // generate token and return if verified successfully
    if (verified) {
      const accessToken = generateToken(this.jwtService, {
        payload: { ...data.user },
        options: {
          expiresIn: '1d',
        },
      });
      const refreshToken = generateToken(this.jwtService, {
        payload: { ...data.user },
        options: {
          expiresIn: '30d',
        },
      });
      return { accessToken, refreshToken };
    }
    throw new HttpException(
      'OTP verification failed. Try again',
      HttpStatus.FORBIDDEN,
    );
  }

  async login(data: LoginDto) {
    // find user
    const user = await this.userService.findOneByPhone(data.phone);
    if (!user) {
      throw new HttpException(
        'User not found. Try again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    // generate otp
    const otpMessage = generateOtpWithMessage(OtpType.LOGIN);
    // send otp sms
    const { otpCode, expireAt, otpMessage: message } = otpMessage;
    //FIXME: Uncomment this
    // await sendSms(SmsProvider.BULKSMSBD, message, data.phone);

    // store otp in db
    const otp = await this.otpService.storeOtp({
      code: otpCode,
      expireAt,
      type: OtpType.LOGIN,
      User: { connect: { id: user.id } },
    });
    return { success: true, message: 'OTP sent', data: user };
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
