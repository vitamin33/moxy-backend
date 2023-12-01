import { ProductAdvatages } from './product-advatages.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductAdvantagesService } from './service/product-advatages.service';
import { AddProductAdvatagesDto } from './dto/add-product-advatages.dto';
import { ProductsService } from './service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@UseGuards(JwtAuthGuard)
@Controller('product-advatages')
export class ProductAdvatagesController {
  constructor(
    private readonly productAdvatagesService: ProductAdvantagesService,
    private readonly productsService: ProductsService,
  ) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async addProductAvatages(
    @Body() dto: AddProductAdvatagesDto,
    @UploadedFile() image,
  ): Promise<ProductAdvatages> {
    // Check if the product exists
    const product = await this.productsService.getProductById(dto.productId);
    if (!product) {
      throw new ProductNotAvailableException(dto.productId);
    }
    return this.productAdvatagesService.addProductAdvatages(dto, image);
  }

  @Get()
  async getProductAdvatages(
    @Param('id') productId: string,
  ): Promise<ProductAdvatages[]> {
    return this.productAdvatagesService.getProductAdvatages(productId);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removeProductAdvatages(@Param('id') id: string): Promise<void> {
    await this.productAdvatagesService.removeProductAdvatages(id);
  }
}
