import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}
  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(@Body() dto: CreateProductDto, @UploadedFiles() images) {
    return this.productService.createProduct(dto, images);
  }
}
