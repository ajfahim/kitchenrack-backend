import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { TApiResponse } from 'src/common/types/apiResponse';
import { OtpType } from 'src/common/types/otpTypes';
import { generateOtpWithMessage } from 'src/common/utils/generateOtp';
import { generateToken } from 'src/common/utils/jwtTokens';
import { OtpService } from 'src/features/otp/otp.service';
import { UserService } from 'src/features/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

type TTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly ConfigService: ConfigService,
  ) {}

  async registration(data: RegistrationDto): Promise<TApiResponse<User>> {
    //create user
    const user = await this.userService.create(data);
    console.log('🚀 ~ AuthService ~ user:', user);
    // generate otp
    const otpMessage = generateOtpWithMessage(
      OtpType.REGISTRATION,
      this.ConfigService,
    );
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

    return {
      success: true,
      statusCode: 200,
      message: 'OTP sent successfully',
      data: user,
    };
  }

  async verifyOtp(data: VerifyOtpDto): Promise<TTokenResponse> {
    const verified = await this.otpService.verifyOtp(data);
    console.log(
      '===========================',
      this.ConfigService.get<string>('jwt.accessTokenExpiration'),
    );
    console.log(
      '===========================',
      this.ConfigService.get<string>('jwt.refreshTokenExpiration'),
    );
    // generate token and return if verified successfully
    if (verified) {
      const accessToken = await generateToken(this.jwtService, {
        payload: { ...data.user },
        options: {
          expiresIn: this.ConfigService.get<string>(
            'jwt.accessTokenExpiration',
          ),
        },
      });

      const refreshToken = await generateToken(this.jwtService, {
        payload: { ...data.user },
        options: {
          expiresIn: this.ConfigService.get<string>(
            'jwt.refreshTokenExpiration',
          ),
        },
      });
      return { accessToken, refreshToken };
    }
    throw new HttpException(
      'OTP verification failed. Try again',
      HttpStatus.FORBIDDEN,
    );
  }

  async login(data: LoginDto): Promise<TApiResponse<User>> {
    console.log('🚀 ~ AuthService ~ login ~ data:', data);
    // find user
    const user = await this.userService.findOneByPhone(data.phone);
    console.log('🚀 ~ AuthService ~ login ~ user:', user);
    if (!user) {
      throw new HttpException(
        'User not found. Try again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    // generate otp
    const otpMessage = generateOtpWithMessage(
      OtpType.LOGIN,
      this.ConfigService,
    );
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

    return {
      success: true,
      statusCode: 200,
      message: 'OTP sent successfully',
      data: user,
    };
  }

  async refreshToken(
    cookies: Record<string, string>,
  ): Promise<{ accessToken: string }> {
    const refreshToken = cookies.refresh_token;
    console.log('🚀 ~ AuthService ~ refreshToken:', refreshToken);
    if (!refreshToken) {
      throw new HttpException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.jwtService.verify(refreshToken);

      // Decode refreshToken and get user details
      const decoded = this.jwtService.decode(refreshToken);
      console.log('🚀 ~ AuthService ~ decoded ~ decoded:', decoded);

      const user = await this.userService.findOneByPhone(decoded.payload.phone);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      // Generate new access token
      const accessToken = await generateToken(this.jwtService, {
        payload: {
          id: user.id,
          phone: user.phone,
          full_name: user.full_name,
          role: user.role,
        },
        options: {
          expiresIn: this.ConfigService.get<string>(
            'jwt.accessTokenExpiration',
          ),
        },
      });

      return { accessToken };
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
    }
  }

  async findOne(id: number): Promise<TApiResponse<any>> {
    return Promise.resolve({
      success: true,
      statusCode: 200,
      message: 'User found successfully',
      data: `This action returns a #${id} auth`,
    });
  }

  async update(id: number): Promise<TApiResponse<any>> {
    return Promise.resolve({
      success: true,
      statusCode: 200,
      message: 'User updated successfully',
      data: `This action updates a #${id} auth`,
    });
  }

  async remove(id: number): Promise<TApiResponse<any>> {
    return Promise.resolve({
      success: true,
      statusCode: 200,
      message: 'User removed successfully',
      data: `This action removes a #${id} auth`,
    });
  }
}
