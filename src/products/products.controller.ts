import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product, ProductDocument } from './product.entity';
import { EditProductDto } from './dto/edit-product.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  @UsePipes(ValidationPipe)
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles() images,
  ): Promise<ProductDocument> {
    return this.productService.createProduct(dto, images);
  }

  @Post('import')
  @UseInterceptors(FilesInterceptor('products'))
  async importProducts(@UploadedFiles() products): Promise<ProductDocument[]> {
    return this.productService.importProducts(products);
  }

  @ApiOperation({
    summary:
      'Edit product with specific id. Send new images with newImages parameter as file.' +
      'And send existed images with currentImages array of image URLs.',
  })
  @ApiResponse({ status: 200, type: [Product] })
  @Post('edit/:id')
  @UseInterceptors(FilesInterceptor('newImages'))
  @UsePipes(ValidationPipe)
  async editProduct(
    @Param('id') id: string,
    @Body() dto: EditProductDto,
    @UploadedFiles() newImages,
  ) {
    return this.productService.editProduct(id, dto, newImages);
  }

  @ApiOperation({ summary: 'Get all product list' })
  @ApiResponse({ status: 200, type: [Product] })
  @Get()
  async getAllProducts(): Promise<ProductDocument[]> {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string): Promise<ProductDocument> {
    return this.productService.getProductbyId(id);
  }
}
