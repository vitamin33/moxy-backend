import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddPromoDto } from './dto/add-promo.dto';
import { Promo } from './promo.entity';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@Injectable()
export class PromosService {
  constructor(
    @InjectModel(Promo.name) private promoModel: Model<Promo>,
    private productService: ProductsService,
    private storageService: StorageService,
  ) {}

  async addPromo(dto: AddPromoDto, image: any) {
    // Check if the product exists
    const product = await this.productService.getProductbyId(dto.productId);
    if (!product) {
      throw new ProductNotAvailableException(dto.productId);
    }

    // Create a new promo document
    const promo = new this.promoModel({
      ...dto,
      product: product._id, // Use the ObjectId of the product
    });

    if (image) {
      const imageUrl = await this.storageService.uploadFile(image);
      promo.imageUrl = imageUrl;
    }

    return await promo.save();
  }

  async getPromos(): Promise<Promo[]> {
    return this.promoModel.find().populate('product').exec();
  }

  async removePromo(id: string): Promise<void> {
    await this.promoModel.findByIdAndRemove(id).exec();
  }
}
