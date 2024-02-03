import { Injectable, NotFoundException } from '@nestjs/common';
import { AddOrChangeProductDto } from './dto/add-change-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Basket, BasketDocument } from './basket.entity';
import mongoose, { Model, Types } from 'mongoose';
import { UsersService } from 'src/modules/users/users.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { RemoveProductDto } from './dto/remove-product.dto';
import { ProductAvailabilityService } from 'src/modules/products/service/product-availability.service';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { compareDimensions } from 'src/common/utility';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { AttributesService } from '../attributes/attributes.service';
import { User } from '../users/user.entity';

@Injectable()
export class BasketService {
  constructor(
    @InjectModel(Basket.name) private basketModel: Model<BasketDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private productAvailabilityService: ProductAvailabilityService,
    private attributesService: AttributesService,
  ) {}

  async addOrChangeProduct(
    userId: string | null,
    guestId: string | null,
    addDto: AddOrChangeProductDto,
  ): Promise<Basket> {
    let basket: mongoose.Document<unknown, {}, BasketDocument> & Basket;

    if (userId && !guestId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      basket = await this.basketModel.findOne({ client: user }).exec();
    } else if (guestId) {
      basket = await this.basketModel.findOne({ guestId }).exec();
    } else {
      throw new Error('A user ID or guest ID must be provided.');
    }

    if (!basket) {
      basket = userId
        ? new this.basketModel({ client: userId })
        : new this.basketModel({ guestId });
    }

    const product = await this.productsService.getProductById(
      addDto.product.productId,
    );
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${addDto.product.productId} not found`,
      );
    }

    const dimensionDto: DimensionDto = addDto.product.dimension;
    let dimensionColor: mongoose.Types.ObjectId | undefined;
    let dimensionSize: mongoose.Types.ObjectId | undefined;
    let dimensionMaterial: mongoose.Types.ObjectId | undefined;

    if (dimensionDto.color) {
      dimensionColor = new mongoose.Types.ObjectId(dimensionDto.color._id);
    }
    if (dimensionDto.size) {
      dimensionSize = new mongoose.Types.ObjectId(dimensionDto.size._id);
    }
    if (dimensionDto.material) {
      dimensionMaterial = new mongoose.Types.ObjectId(
        dimensionDto.material._id,
      );
    }

    const dimensionProps: any = {};
    // Check if properties are defined and add them to the object
    if (dimensionColor) {
      dimensionProps.color = dimensionColor;
    }
    if (dimensionSize) {
      dimensionProps.size = dimensionSize;
    }
    if (dimensionMaterial) {
      dimensionProps.material = dimensionMaterial;
    }
    if (dimensionDto.quantity !== undefined) {
      dimensionProps.quantity = dimensionDto.quantity;
    }

    const availableDimention =
      await this.productAvailabilityService.findAvailableProductDimension(
        addDto.product.productId,
        dimensionDto,
      );
    if (!availableDimention) {
      throw new ProductNotAvailableException(
        addDto.product.productId,
        dimensionColor,
        dimensionSize,
        dimensionMaterial,
        dimensionDto.quantity,
      );
    }
    dimensionProps.images = availableDimention.images;

    const existingItemIndex = basket.basketItems.findIndex(
      (item) => item.product.toString() === product._id.toString(),
    );

    if (existingItemIndex !== -1) {
      const existingItem = basket.basketItems[existingItemIndex];
      const existingDimension = existingItem.dimensions.find((dim) =>
        compareDimensions(dim, availableDimention),
      );

      if (existingDimension) {
        existingDimension.quantity = dimensionDto.quantity;
      } else {
        existingItem.dimensions.push(dimensionProps);
      }
    } else {
      basket.basketItems.push({
        product: product._id,
        dimensions: [dimensionProps],
      });
    }

    const result = await basket.save();
    await result.populate('basketItems.dimensions.color');
    await result.populate('client', 'mobileNumber');
    await result.populate('basketItems.product');
    await result.populate('basketItems.product.dimensions.color');

    return result;
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

    const result = await basket.save();
    await result.populate('basketItems.dimensions.color');
    await result.populate('client', 'mobileNumber');
    await result.populate('basketItems.product');
    await result.populate('basketItems.product.dimensions.color');
    return basket;
  }

  async getBasket(
    userId: string | null,
    guestId: string | null,
  ): Promise<Basket> {
    let basket: Basket;

    if (userId && !guestId) {
      const user = await this.usersService.getUserById(userId);
      if (user) {
        basket = await this.basketModel.findOne({ client: user }).exec();
      } else {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    } else if (guestId) {
      basket = await this.basketModel.findOne({ guestId: guestId }).exec();
    }

    if (!basket) {
      basket = new this.basketModel({
        guestId: guestId,
        basketItems: [], // Initialize empty basket
      });

      // Optionally save the new basket if you want to persist empty baskets for guests
      // await basket.save();
    }

    return basket;
  }
  async loadBasketByUserId(user: User) {
    return await this.basketModel
      .findOne({ client: user })
      .populate({
        path: 'client',
        model: 'User', // Adjust this to match the model name for User
        select: 'firstName secondName mobileNumber city novaPost',
      })
      .populate({
        path: 'basketItems.product',
        model: 'Product', // Adjust this to match the model name for Product
        populate: {
          path: 'dimensions.color', // Populate the color field within dimensions
          model: 'Color', // Adjust this to match the model name for Color
        },
      })
      .populate({
        path: 'basketItems.dimensions.color', // Populate the color field within dimensions
        model: 'Color', // Adjust this to match the model name for Color
      })
      .lean()
      .exec();
  }

  async clearBasket(userId: string): Promise<void> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.basketModel.deleteOne({ client: user });
  }
}
