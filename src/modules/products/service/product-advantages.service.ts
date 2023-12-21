import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductAdvantages } from '../product-advantages.entity';
import { StorageService } from 'src/modules/storage/storage.service';
import { AddProductAdvantagesDto } from '../dto/add-product-advantages.dto';
import { MediaType } from 'src/modules/settings/media.entity';

@Injectable()
export class ProductAdvantagesService {
  constructor(
    @InjectModel(ProductAdvantages.name)
    private productAdvantagesModule: Model<ProductAdvantages>,
    private storageService: StorageService,
  ) {}

  async addProductAdvantages(dto: AddProductAdvantagesDto, image: any) {
    // Create a new product advantages document
    const productAdvantage = new this.productAdvantagesModule({
      ...dto,
      product: dto.productId,
    });

    if (image) {
      const imageUrl = await this.storageService.uploadFile(
        image,
        MediaType.Image,
      );
      productAdvantage.imageUrl = imageUrl;
    }

    return await productAdvantage.save();
  }

  async getProductAdvantages(productId: string): Promise<ProductAdvantages[]> {
    const result = await this.productAdvantagesModule
      .find({ productId })
      .lean()
      .exec();
    return result;
  }

  async removeProductAdvantages(id: string) {
    const productAdvantage = await this.productAdvantagesModule
      .findByIdAndRemove(id)
      .exec();
    if (productAdvantage) {
      // Update the discountPrice in the Product entity
      await this.updateProductDiscountPrice(productAdvantage.productId, 0); // zero means no discount
    }
  }

  private async updateProductDiscountPrice(
    productId: string,
    discount: number,
  ) {
    //await this.productService.updateProductDiscountPrice(productId, discount);
  }
}
