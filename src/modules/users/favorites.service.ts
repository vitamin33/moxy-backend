import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.entity';
import { Product, ProductDocument } from 'src/modules/products/product.entity';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async addFavoriteProduct(userId: string, productId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotAvailableException(productId);
    }

    const productIdString = productId.toString();
    if (
      !user.favoriteProducts.some(
        (favProduct) => favProduct._id.toString() === productIdString,
      )
    ) {
      user.favoriteProducts.push(product);
      await user.save();

      // Update numFavorites field for the product
      product.numFavorites++;
      await product.save();

      return user;
    }

    return user;
  }

  async removeFavoriteProduct(
    userId: string,
    productId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotAvailableException(productId);
    }

    const productIdString = productId.toString();
    if (
      user.favoriteProducts.some(
        (favProduct) => favProduct._id.toString() === productIdString,
      )
    ) {
      user.favoriteProducts = user.favoriteProducts.filter(
        (favProduct) => favProduct._id.toString() !== productIdString,
      );
      await user.save();

      // Update numFavorites field for the product
      if (product.numFavorites > 0) {
        product.numFavorites--;
        await product.save();
      }

      return user;
    }

    return user;
  }

  async getFavoriteProducts(userId: string): Promise<Product[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('favoriteProducts');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.favoriteProducts;
  }
}
