import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

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
