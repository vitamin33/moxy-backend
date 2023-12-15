import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddReviewDto } from './dto/add-review.dto';
import { Review } from './review.entity';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/service/products.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private productService: ProductsService,
    private storageService: StorageService,
  ) {}

  async addReview(dto: AddReviewDto, image: any) {
    let product;

    // Check if productId is provided
    if (dto.productId) {
      product = await this.productService.getProductById(dto.productId);
      if (!product) {
        throw new ProductNotAvailableException(dto.productId);
      }
    }

    const review = new this.reviewModel({
      ...dto,
    });

    if (product) {
      review.productId = product._id;
    }

    if (image) {
      const imageUrl = await this.storageService.uploadFile(image);
      review.avatarImageUrl = imageUrl;
    }

    return await review.save();
  }

  async getReviews(): Promise<Review[]> {
    const result = await this.reviewModel.find().lean().exec();
    return result;
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    // TODO implement getting reviews only where 'productId' field is equal 'productId' paramter
    const result = await this.reviewModel.find().lean().exec();
    return result;
  }

  async removeReview(id: string) {
    const review = await this.reviewModel.findByIdAndRemove(id).exec();
    if (!review) {
      this.storageService.deleteFile(review.avatarImageUrl);
    }
  }
}
