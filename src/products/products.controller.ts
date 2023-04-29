import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product } from './product.entity';
import { EditProductDto } from './dto/edit-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(@Body() dto: CreateProductDto, @UploadedFiles() images) {
    return this.productService.createProduct(dto, images);
  }

  @Post('edit/:id')
  @UseInterceptors(FilesInterceptor('images'))
  async editProduct(
    @Param('id') id: string,
    @Body() dto: EditProductDto,
    @UploadedFiles() images,
  ) {
    return this.productService.editProduct(id, dto, images);
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
