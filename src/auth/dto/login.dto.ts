import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('BD')
  @IsNotEmpty()
  phone: string;
}
