import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { UserRole } from 'src/common/types/user';

export class User {
  @IsNumber()
  id: number;

  @IsString()
  phone: string;

  @IsString()
  full_name: string;

  @IsEnum(UserRole)
  role: string;
}
export class VerifyOtpDto {
  @IsNumber()
  code: number;

  @IsString()
  type: string;

  @ValidateNested({ each: true })
  @Type(() => User)
  user: User;
}
