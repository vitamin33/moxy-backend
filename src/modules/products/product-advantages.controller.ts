import { ProductAdvantages } from './product-advantages.entity';
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
import { ProductAdvantagesService } from './service/product-advantages.service';
import { AddProductAdvantagesDto } from './dto/add-product-advantages.dto';
import { ProductsService } from './service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@UseGuards(JwtAuthGuard)
@Controller('product-advantages')
export class ProductAdvantagesController {
  constructor(
    private readonly productAdvantagesService: ProductAdvantagesService,
    private readonly productsService: ProductsService,
  ) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async addProductAvatages(
    @Body() dto: AddProductAdvantagesDto,
    @UploadedFile() image,
  ): Promise<ProductAdvantages> {
    // Check if the product exists
    const product = await this.productsService.getProductById(dto.productId);
    if (!product) {
      throw new ProductNotAvailableException(dto.productId);
    }
    return this.productAdvantagesService.addProductAdvantages(dto, image);
  }

  @Get()
  async getProductAdvantages(
    @Param('id') productId: string,
  ): Promise<ProductAdvantages[]> {
    return this.productAdvantagesService.getProductAdvantages(productId);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removeProductAdvantages(@Param('id') id: string): Promise<void> {
    await this.productAdvantagesService.removeProductAdvantages(id);
  }
}
