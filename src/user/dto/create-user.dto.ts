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

  @IsEmail()
  email?: string;

  @IsPhoneNumber('BD')
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
