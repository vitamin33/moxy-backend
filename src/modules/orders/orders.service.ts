import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.entity';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { GuestUserDto as UserDto } from 'src/modules/users/dto/guest-user.dto';
import { UsersService } from 'src/modules/users/users.service';
import { OrderDocument } from './order.entity';
import { User } from 'src/modules/users/user.entity';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FindByDto } from './dto/find-by.dto';
import { ProductsService } from 'src/modules/products/service/products.service';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { OrderNotFoundException } from 'src/common/exception/order-not-found.exception';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async getPaginatedAllOrders(skip: number, limit: number) {
    // Fetch a subset of orders using the skip and limit options
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'client',
        select: '-orders -city -favoriteProducts -role', // Exclude fields
      })
      .skip(skip)
      .limit(limit)
      .exec();

    const ordersWithImageUrls = await Promise.all(
      orders.map(async (order) => {
        const orderedItemsWithImageUrls = await Promise.all(
          order.orderedItems.map(async (orderedItem) => {
            const product = await this.productsService.getProductbyId(
              orderedItem.product.toString(),
            );
            if (!product) {
              return null;
            }
            const imageUrl =
              product.images.length > 0
                ? product.images[0] // Use the first value in the images array
                : undefined; // Set a default value when images array is empty

            return {
              product: orderedItem.product.toString(),
              productName: product.name,
              productPrice: product.salePrice,
              dimensions: orderedItem.dimensions,
              imageUrl,
            };
          }),
        );

        return {
          ...order.toObject(),
          orderedItems: orderedItemsWithImageUrls,
        };
      }),
    );

    return ordersWithImageUrls;
  }

  async getPaginatedOrdersBy(
    dto: FindByDto,
    skip: number,
    limit: number,
  ): Promise<OrderDocument[]> {
    const query = this.orderModel.find();

    if (dto.statuses && dto.statuses.length > 0) {
      query.in('status', dto.statuses);
    }

    if (dto.paymentTypes && dto.paymentTypes.length > 0) {
      query.in('paymentType', dto.paymentTypes);
    }

    if (dto.deliveryTypes && dto.deliveryTypes.length > 0) {
      query.in('deliveryType', dto.deliveryTypes);
    }

    if (dto.fromDate) {
      const fromDate = new Date(dto.fromDate).toISOString();
      query.gte('createdAt', fromDate);
    }

    if (dto.toDate) {
      const toDate = new Date(dto.toDate).toISOString();
      query.lte('createdAt', toDate);
    }

    // Apply pagination by adding the skip and limit options
    const paginatedOrders = await query
      .sort({ createdAt: -1 })
      .populate({
        path: 'client',
        select: '-orders -city -favoriteProducts -role', // Exclude fields
      })
      .skip(skip)
      .limit(limit)
      .exec();

    return paginatedOrders;
  }

  async createOrder(orderDto: CreateOrderDto): Promise<OrderDocument> {
    let client: User;
    if (orderDto.userId) {
      client = await this.usersService.getUserById(orderDto.userId);
      if (!client) {
        throw new UserNotFoundException(orderDto.userId);
      }
    } else {
      client = await this.usersService.getUserByMobileNumber(
        orderDto.client.mobileNumber,
      );
      if (!client) {
        const dto = new UserDto();
        dto.firstName = orderDto.client.firstName;
        dto.secondName = orderDto.client.secondName;
        dto.mobileNumber = orderDto.client.mobileNumber;
        dto.city = orderDto.city;
        client = await this.usersService.createGuestUser(dto);
      }
    }
    const orderedItems = [];
    for (const product of orderDto.products) {
      orderedItems.push({
        product: product._id,
        dimensions: product.dimensions,
      });
    }
    const createdOrder = new this.orderModel({
      ...orderDto,
      client,
      city: orderDto.city,
      novaPost: orderDto.novaPost,
      orderedItems,
    });
    const resultOrder = await createdOrder.save();
    await this.usersService.addOrder(client._id.toString(), createdOrder);
    return resultOrder;
  }

  async editOrder(orderDto: ChangeOrderDto): Promise<OrderDocument> {
    // Check if orderDto.products is present and not empty
    const shouldUpdateProducts =
      orderDto.products && orderDto.products.length > 0;

    // If products are present, update the orderedItems field
    const orderedItems = shouldUpdateProducts
      ? orderDto.products.map((product) => ({
          product: product._id,
          dimensions: product.dimensions,
        }))
      : undefined;

    // Remove the products field from orderDto to avoid updating it
    delete orderDto.products;

    // Update the order, including the orderedItems field if necessary
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      { _id: orderDto.orderId },
      shouldUpdateProducts ? { ...orderDto, orderedItems } : orderDto,
      { new: true },
    );

    if (!updatedOrder) {
      throw new OrderNotFoundException(orderDto.orderId);
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: string) {
    await this.orderModel.findByIdAndDelete(orderId).exec();
  }

  async getOrderById(id: string) {
    return this.orderModel.findOne({ _id: id }).populate('client').exec();
  }
}
