import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/role-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(@Body() dto: CreateProductDto, @UploadedFiles() images) {
    return this.productService.createProduct(dto, images);
  }

  @ApiOperation({ summary: 'Get all product list' })
  @ApiResponse({ status: 200, type: [Product] })
  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string): Promise<Product> {
    return this.productService.getProductbyId(id);
  }
}
