import { Injectable, NotFoundException } from '@nestjs/common';
import { AddOrChangeProductDto } from './dto/add-change-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Basket, BasketDocument } from './basket.entity';
import mongoose, { Model, Types } from 'mongoose';
import { UsersService } from 'src/modules/users/users.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { RemoveProductDto } from './dto/remove-product.dto';
import { Color, Product } from 'src/modules/products/product.entity';
import { ProductAvailabilityService } from 'src/modules/products/service/product-availability.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';

@Injectable()
export class BasketService {
  constructor(
    @InjectModel(Basket.name) private basketModel: Model<BasketDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private productAvailabilityService: ProductAvailabilityService,
  ) {}
  async addOrChangeProduct(
    userId: string,
    addDto: AddOrChangeProductDto,
  ): Promise<Basket> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let basket = await this.basketModel.findOne({ client: user }).exec();
    if (!basket) {
      basket = new this.basketModel({ client: user });
    }

    const product = await this.productsService.getProductbyId(
      addDto.product.productId,
    );
    if (!product) {
      throw new ProductNotAvailableException(product.id);
    }

    const dimension = product.dimensions.find(
      (dim) => dim.color === addDto.product.dimension.color,
    );
    if (!dimension) {
      throw new ProductNotAvailableException(
        product.id,
        addDto.product.dimension.color,
      );
    }

    const isAvailable =
      await this.productAvailabilityService.isProductAvailable(
        addDto.product.productId,
        addDto.product.dimension,
      );
    if (!isAvailable) {
      throw new ProductNotAvailableException(
        product.id,
        addDto.product.dimension.color,
        addDto.product.dimension.quantity,
      );
    }

    const existingItem = basket.basketItems.find(
      (item) => item.product.toString() === addDto.product.productId,
    );

    if (existingItem) {
      const existingDimension = existingItem.dimensions.find(
        (dim) => dim.color === addDto.product.dimension.color,
      );

      if (existingDimension) {
        existingDimension.quantity = addDto.product.dimension.quantity;
      } else {
        const color =
          Color[addDto.product.dimension.color as keyof typeof Color];
        existingItem.dimensions.push({
          color: color,
          quantity: addDto.product.dimension.quantity,
        });
      }
    } else {
      const color = Color[addDto.product.dimension.color as keyof typeof Color];
      basket.basketItems.push({
        product: product._id,
        dimensions: [
          {
            color: color,
            quantity: addDto.product.dimension.quantity,
          },
        ],
      });
    }

    await basket.save();
    return basket;
  }

  async removeProduct(
    userId: string,
    removeDto: RemoveProductDto,
  ): Promise<BasketDocument> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const basket = await this.basketModel.findOne({ client: user });
    if (!basket) {
      throw new NotFoundException('Basket not found');
    }

    const itemIndex = basket.basketItems.findIndex((item) => {
      const itemId = item.product.toString();
      return itemId === removeDto.productId;
    });

    if (itemIndex === -1) {
      throw new NotFoundException('Basket item not found');
    }

    basket.basketItems.splice(itemIndex, 1);

    await basket.save();
    return basket;
  }

  async getBasket(userId: string): Promise<Basket> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const basket = await this.basketModel
      .findOne({ client: user })
      .populate('basketItems.product')
      .exec();
    return basket;
  }

  async clearBasket(userId: string): Promise<void> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.basketModel.deleteOne({ client: user });
  }
}
