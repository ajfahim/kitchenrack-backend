import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { AuthorizationGuard } from 'src/auth/guards/authorization.guard';
import { UserRole } from 'src/common/types/user';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async create(@Body() createProductDto: CreateProductDto, @Res() response: Response) {
    const result = await this.productService.create(createProductDto);
    return response.status(result.statusCode).json(result);
  }

  @Get()
  async findAll(@Query() filterDto: ProductFilterDto, @Res() response: Response) {
    const result = await this.productService.findAll(filterDto);
    return response.status(result.statusCode).json(result);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Res() response: Response) {
    const result = await this.productService.findBySlug(slug);
    return response.status(result.statusCode).json(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.productService.findOne(+id);
    return response.status(result.statusCode).json(result);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() response: Response
  ) {
    console.log(updateProductDto);
    const result = await this.productService.update(+id, updateProductDto);
    return response.status(result.statusCode).json(result);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.productService.remove(+id);
    return response.status(result.statusCode).json(result);
  }
}
