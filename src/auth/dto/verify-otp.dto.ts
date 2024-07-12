import { IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  code: string;

  @IsString()
  type: string;

  @IsString()
  user_id: string;
}
