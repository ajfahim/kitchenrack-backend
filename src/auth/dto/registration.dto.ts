import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/common/types/user';

export class RegistrationDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsPhoneNumber('BD')
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
