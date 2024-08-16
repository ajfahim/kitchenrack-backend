import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpType } from 'src/common/types/otpTypes';

export class StoreOtpDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @IsNotEmpty()
  @IsEnum(OtpType)
  type: string;
}
