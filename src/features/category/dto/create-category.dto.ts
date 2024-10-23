import { IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  icon?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  banner_image?: string;

  @IsOptional()
  @IsInt()
  parent_id?: number;
}
