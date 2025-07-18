import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddPromoDto } from './dto/add-promo.dto';
import { Promo } from './promo.entity';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { MediaType } from '../settings/media.entity';

@Injectable()
export class PromosService {
  constructor(
    @InjectModel(Promo.name) private promoModel: Model<Promo>,
    private productService: ProductsService,
    private storageService: StorageService,
  ) {}

  async addPromo(dto: AddPromoDto, image: any) {
    // Check if the product exists
    const product = await this.productService.getProductById(dto.productId);
    if (!product) {
      throw new ProductNotAvailableException(dto.productId);
    }

    // Create a new promo document
    const promo = new this.promoModel({
      ...dto,
      product: product._id, // Use the ObjectId of the product
    });

    if (image) {
      const imageUrl = await this.storageService.uploadFile(
        image,
        MediaType.Image,
      );
      promo.imageUrl = imageUrl;
    }

    // Update the discountPrice in the Product entity
    await this.updateProductDiscountPrice(dto.productId, dto.discount);

    return await promo.save();
  }

  async getPromos(): Promise<Promo[]> {
    const result = await this.promoModel
      .find()
      .populate({
        path: 'product',
        select: '-dimensions', // Exclude fields
      })
      .lean()
      .exec();
    return result;
  }

  async removePromo(id: string) {
    const promo = await this.promoModel.findByIdAndRemove(id).exec();
    if (promo) {
      // Update the discountPrice in the Product entity
      await this.updateProductDiscountPrice(promo.productId, 0); // zero means no discount
    }
  }

  private async updateProductDiscountPrice(
    productId: string,
    discount: number,
  ) {
    await this.productService.updateProductDiscountPrice(productId, discount);
  }
}
