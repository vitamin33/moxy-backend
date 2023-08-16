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
import { ProductsService } from './service/products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product, ProductDocument } from './product.entity';
import { EditProductDto } from './dto/edit-product.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/modules/auth/role-auth.decorator';
import { RolesGuard } from 'src/modules/auth/roles.guard';

@ApiTags('Products')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles() images,
  ): Promise<ProductDocument> {
    return this.productService.createProduct(dto, images);
  }

  @Post('import')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
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
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
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
