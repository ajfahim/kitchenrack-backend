import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Res() response: Response) {
    const result = await this.categoryService.create(createCategoryDto);
    
    return response.status(result.statusCode).json(result);
  }

  @Get()
  async findAll(@Query('parent_id') parentId: number, @Res() response: Response) {
    const result = await this.categoryService.findAll(parentId);
    return response.status(result.statusCode).json(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.categoryService.findOne(+id);
    return response.status(result.statusCode).json(result);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Res() response: Response
  ) {
    const result = await this.categoryService.update(+id, updateCategoryDto);
    return response.status(result.statusCode).json(result);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.categoryService.remove(+id);
    return response.status(result.statusCode).json(result);
  }
}
