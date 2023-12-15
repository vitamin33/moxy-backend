import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from './media.entity';
import { Model, set } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { AddMediaDto } from './dto/add-media.dto';
import { ActivateHomeMediaDto } from './dto/activate-home-media.dto';

@Injectable()
export class SettingsService {
  private readonly usdToUahRate = 37.44;
  private readonly shippingRateInUSD = 17.0;

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<Media>,

    private storageService: StorageService,
  ) {}

  getRateForShipping(): number {
    return this.shippingRateInUSD;
  }
  getUsdToUahRate(): number {
    return this.usdToUahRate;
  }

  async addMedia(dto: AddMediaDto, mediaFile: any) {
    const mediaUrls = [];
    const fileUrl = await this.storageService.uploadFile(mediaFile);
    mediaUrls.push(fileUrl);

    const newMedia = new this.mediaModel({
      ...dto,
      mediaUrls, // Store the media URLs
    });

    return await newMedia.save();
  }

  async addMediaWithMultipleFiles(dto: AddMediaDto, mediaFiles: any) {
    const mediaUrls = [];
    for (const file of mediaFiles) {
      const fileUrl = await this.storageService.uploadFile(file);
      mediaUrls.push(fileUrl);
    }

    const newMedia = new this.mediaModel({
      ...dto,
      mediaUrls, // Store the media URLs
    });

    return await newMedia.save();
  }

  async removeMedia(id: string) {
    const removeMedia = await this.mediaModel.findByIdAndRemove(id).exec();

    for (const media of removeMedia.mediaUrls) {
      if (!media) {
        this.storageService.deleteFile(media);
      }
    }
    return removeMedia;
  }

  async activateHomeMedia(dto: ActivateHomeMediaDto) {
    const { mediaIds } = dto;

    await this.mediaModel.updateMany({}, { $set: { activeHome: false } });

    const updatedMedia = await this.mediaModel
      .updateMany({ _id: { $in: mediaIds } }, { $set: { activeHome: true } })
      .exec();

    return updatedMedia;
  }

  async getHomeMedia() {
    const homeMedia = await this.mediaModel
      .find({ activeHome: true })
      .lean()
      .exec();
    return homeMedia;
  }

  async getAllMedia() {
    const homeMedia = await this.mediaModel.find().exec();
    return homeMedia;
  }
}
