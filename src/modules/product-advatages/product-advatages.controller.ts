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
import { AddProductAdvatagesDto } from './dto/add-product-advatages.dto';
import { ProductAdvatagesService } from './product-advatages.service';

@UseGuards(JwtAuthGuard)
@Controller('product-advatages')
export class ProductAdvatagesController {
  constructor(
    private readonly productAdvatagesService: ProductAdvatagesService,
  ) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async addProductAvatages(
    @Body() addProductAdvatagesDto: AddProductAdvatagesDto,
    @UploadedFile() image,
  ): Promise<ProductAdvatages> {
    return this.productAdvatagesService.addProductAdvatages(
      addProductAdvatagesDto,
      image,
    );
  }

  @Get()
  async getProductAdvatages(): Promise<ProductAdvatages[]> {
    return this.productAdvatagesService.getProductAdvatages();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removeProductAdvatages(@Param('id') id: string): Promise<void> {
    await this.productAdvatagesService.removeProductAdvatages(id);
  }
}
