import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserRole } from 'src/common/types/user';

export class User {
  @IsNumberString()
  id: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: string;
}
export class VerifyOtpDto {
  @IsString()
  code: string;

  @IsString()
  type: string;

  @ValidateNested({ each: true })
  @Type(() => User)
  user: User;
}
