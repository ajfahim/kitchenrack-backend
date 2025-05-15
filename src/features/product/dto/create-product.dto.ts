import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  IsJSON,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

enum ProductUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  PIECE = 'piece',
  PACK = 'pack',
  BOX = 'box',
  BOTTLE = 'bottle',
  JAR = 'jar',
  LITER = 'L',
  MILLILITER = 'ml',
  DOZEN = 'dozen',
  PAIR = 'pair'
}

export class CreateProductImageDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  display_order?: number;
}

export class CreateProductAttributeDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class CreateProductVariantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsJSON()
  attributes: string; // JSON string of attributes
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsJSON()
  dimensions?: string; // JSON string of dimensions

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  categories: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeDto)
  attributes?: CreateProductAttributeDto[];
}
