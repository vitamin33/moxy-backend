import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  Request,
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
import { SetProductForSaleDto } from './dto/set-product-forsale.dto';

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
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }

  @Get('details/:id')
  async getProductDetails(@Param('id') id: string) {
    return await this.productService.getProductDetails(id);
  }

  @ApiOperation({ summary: 'Set product for sale (Admin Only)' })
  @ApiResponse({ status: 200, type: Product })
  @Post('set-for-sale')
  @Roles('ADMIN') // Requires ADMIN role
  @UseGuards(RolesGuard)
  async setProductForSale(@Body() dto: SetProductForSaleDto) {
    return this.productService.setProductForSale(dto.productId, dto.forSale);
  }

  @ApiOperation({ summary: 'Get selling products' })
  @ApiResponse({ status: 200, type: [Product] })
  @Get('selling-products')
  async getSellingProducts(@Request() req: any) {
    const userId = req.user.id;
    return this.productService.getSellingProducts(userId);
  }

  @ApiOperation({ summary: 'Get recommended products' })
  @ApiResponse({ status: 200, type: [Product] })
  @Get('recommend')
  async getRecommendedProducts(@Request() req: any) {
    const userId = req.user.id;
    return this.productService.getRecommendedProducts(userId);
  }

  @ApiOperation({ summary: 'Get resale products' })
  @ApiResponse({ status: 200, type: [Product] })
  @Get('resale')
  async getResaleProducts(@Request() req: any) {
    const userId = req.user.id;
    return this.productService.getResaleProducts(userId);
  }

  @ApiOperation({ summary: 'Delete product (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @Delete(':id')
  @Roles('ADMIN') // Requires ADMIN role
  @UseGuards(RolesGuard)
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }
}
