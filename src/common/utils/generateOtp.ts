// import { ConfigService } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { OtpType } from 'src/common/types/otpTypes';

export const generateOtpWithMessage = (
  otpType: OtpType,
  configService: ConfigService,
) => {
  const otpCode = generateRandomOtp(); // Function to generate a random OTP code
  let otpMessage: string;

  const otpValidityMin = parseInt(configService.get<string>('otpValidityMin'));

  // Set expiration for registration OTP (10 Minutes)
  const expireAt = new Date();
  expireAt.setMinutes(expireAt.getMinutes() + otpValidityMin);

  //set messages
  switch (otpType) {
    case OtpType.REGISTRATION:
      otpMessage = `Welcome to Kitchen Rack. Your OTP for registration is ${otpCode}. This code is only valid for ${otpValidityMin} minutes.`;
      break;

    case OtpType.LOGIN:
      otpMessage = `Welcome to Kitchen Rack. Your OTP for login is ${otpCode}. This code is only valid for ${otpValidityMin} minutes.`;
      break;

    case OtpType.ORDER_PLACEMENT:
      otpMessage = `Welcome to Kitchen Rack. Your OTP for order placement is ${otpCode}. This code is only valid for ${otpValidityMin} minutes.`;
      break;

    default:
      throw new Error('Unsupported OTP type');
  }

  return { otpCode, expireAt, otpMessage };
};

const generateRandomOtp = () => {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};
