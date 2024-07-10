import { IsDate, IsNotEmpty } from 'class-validator';

export class StoreOtpDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;
}
