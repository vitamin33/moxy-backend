import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddPromoDto } from './dto/add-promo.dto';
import { Promo } from './promo.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PromosService {
  constructor(
    @InjectModel(Promo.name) private promoModel: Model<Promo>,
    private storageService: StorageService,
  ) {}

  async addPromo(dto: AddPromoDto, image: any) {
    const promo = new this.promoModel(dto);

    if (image) {
      const imageUrl = await this.storageService.uploadFile(image);
      promo.imageUrl = imageUrl; // Change images to imageUrl
    }

    return await promo.save();
  }

  async getPromos(): Promise<Promo[]> {
    return this.promoModel.find().exec();
  }

  async removePromo(id: string): Promise<void> {
    await this.promoModel.findByIdAndRemove(id).exec();
  }
}
