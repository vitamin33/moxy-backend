import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { ProductAdvatages } from './product-advatages.entity';
import { AddProductAdvatagesDto } from './dto/add-product-advatages.dto';

@Injectable()
export class ProductAdvatagesService {
  constructor(
    @InjectModel(ProductAdvatages.name)
    private productAdvatagesModule: Model<ProductAdvatages>,
    private productService: ProductsService,
    private storageService: StorageService,
  ) {}

  async addProductAdvatages(dto: AddProductAdvatagesDto, image: any) {
    // Check if the product exists
    const product = await this.productService.getProductById(dto.productId);
    if (!product) {
      throw new ProductNotAvailableException(dto.productId);
    }

    // Create a new product advatages document
    const productAdvatage = new this.productAdvatagesModule({
      ...dto,
      product: product._id, // Use the ObjectId of the product
    });

    if (image) {
      const imageUrl = await this.storageService.uploadFile(image);
      productAdvatage.imageUrl = imageUrl;
    }

    // Update the discountPrice in the Product entity
    // await this.updateProductDiscountPrice(dto.productId, dto.discount);

    return await productAdvatage.save();
  }

  async getProductAdvatages(): Promise<ProductAdvatages[]> {
    const result = await this.productAdvatagesModule
      .find()
      .populate({
        path: 'product',
        select: '-dimensions', // Exclude fields
      })
      .lean()
      .exec();
    return result;
  }

  async removeProductAdvatages(id: string) {
    const productAdvatage = await this.productAdvatagesModule
      .findByIdAndRemove(id)
      .exec();
    if (productAdvatage) {
      // Update the discountPrice in the Product entity
      await this.updateProductDiscountPrice(productAdvatage.productId, 0); // zero means no discount
    }
  }

  private async updateProductDiscountPrice(
    productId: string,
    discount: number,
  ) {
    await this.productService.updateProductDiscountPrice(productId, discount);
  }
}
