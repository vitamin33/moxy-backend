import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Product } from 'src/products/product.entity';
import { User } from './user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':productId')
  async addFavoriteProduct(
    @Param('productId') productId: string,
    @Request() req: any,
  ): Promise<User> {
    const userId = req.user.id;
    return this.favoritesService.addFavoriteProduct(userId, productId);
  }

  @Delete(':productId')
  async removeFavoriteProduct(
    @Param('productId') productId: string,
    @Request() req: any,
  ): Promise<User> {
    const userId = req.user.id;
    return this.favoritesService.removeFavoriteProduct(userId, productId);
  }

  @Get()
  async getFavoriteProducts(@Request() req: any): Promise<Product[]> {
    const userId = req.user.id;
    return this.favoritesService.getFavoriteProducts(userId);
  }
}
