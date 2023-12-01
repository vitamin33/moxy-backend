import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductAdvatages } from '../product-advatages.entity';
import { StorageService } from 'src/modules/storage/storage.service';
import { AddProductAdvatagesDto } from '../dto/add-product-advatages.dto';

@Injectable()
export class ProductAdvantagesService {
  constructor(
    @InjectModel(ProductAdvatages.name)
    private productAdvatagesModule: Model<ProductAdvatages>,
    private storageService: StorageService,
  ) {}

  async addProductAdvatages(dto: AddProductAdvatagesDto, image: any) {
    // Create a new product advatages document
    const productAdvatage = new this.productAdvatagesModule({
      ...dto,
      product: dto.productId,
    });

    if (image) {
      const imageUrl = await this.storageService.uploadFile(image);
      productAdvatage.imageUrl = imageUrl;
    }

    // Update the discountPrice in the Product entity
    // await this.updateProductDiscountPrice(dto.productId, dto.discount);

    return await productAdvatage.save();
  }

  async getProductAdvatages(productId: string): Promise<ProductAdvatages[]> {
    const result = await this.productAdvatagesModule
      .find({ productId })
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
    //await this.productService.updateProductDiscountPrice(productId, discount);
  }
}
