import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/common/types/user';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  email?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
