import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductDocument } from './product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private storageService: StorageService,
  ) {}
  async createProduct(dto: CreateProductDto, images: [any]): Promise<Product> {
    if (images) {
      const result = [];
      const product = new this.productModel(dto);
      for (const image of images) {
        const imageUrl = await this.storageService.uploadFile(image);

        console.log('Saved image url: ', imageUrl);
        result.push(imageUrl);
      }
      product.$set('images', result);
      return await product.save();
    } else {
      throw new HttpException('No image file.', HttpStatus.BAD_REQUEST);
    }
  }
}
