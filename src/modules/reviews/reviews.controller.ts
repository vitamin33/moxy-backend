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
import { AddReviewDto } from './dto/add-review.dto';
import { Review, ReviewStats } from './review.entity';
import { ReviewsService } from './reviews.service';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async addReview(
    @Body() dto: AddReviewDto,
    @UploadedFile() image,
  ): Promise<Review> {
    return this.reviewsService.addReview(dto, image);
  }

  @Get()
  async getAllReviews(): Promise<Review[]> {
    return this.reviewsService.getReviews();
  }

  @Get('product/:id')
  async getReviewsByProductId(
    @Param('id') productId: string,
  ): Promise<Review[]> {
    return this.reviewsService.getReviewsByProductId(productId);
  }

  @Get('stats/:id')
  async getReviewStatsByProductId(
    @Param('id') productId: string,
  ): Promise<ReviewStats> {
    return this.reviewsService.getReviewStatsByProductId(productId);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removeReview(@Param('id') id: string): Promise<void> {
    await this.reviewsService.removeReview(id);
  }
}
