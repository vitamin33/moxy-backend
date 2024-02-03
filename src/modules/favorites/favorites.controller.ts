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
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Product } from 'src/modules/products/product.entity';
import { User } from '../users/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Favorites')
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
    const guestId = req.guestId;

    return this.favoritesService.getFavoriteProducts(userId, guestId);
  }
}
