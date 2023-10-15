import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, Status } from './order.entity';
import mongoose, { Model } from 'mongoose';
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
import { Dimension } from 'src/common/entity/dimension.entity';
import { convertToDimension, fillAttributes } from 'src/common/utility';
import { AttributesWithCategories } from '../attributes/attribute.entity';
import { AttributesService } from '../attributes/attributes.service';
import { DimensionDto } from 'src/common/dto/dimension.dto';

@Injectable()
export class OrdersService {
  private attributes: AttributesWithCategories;
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private attributesService: AttributesService,
  ) {
    this.initializeAttributes();
  }

  private async initializeAttributes() {
    this.attributes = await this.attributesService.getAttributes();
  }

  async getPaginatedAllOrders(skip: number, limit: number) {
    // Fetch a subset of orders using the skip and limit options
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'client',
        select:
          '-orders -city -favoriteProducts -role -password -refreshToken -novaPost', // Exclude fields
      })
      .select('-city -novaPost')
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const ordersObjects = await Promise.all(
      orders.map(async (order) => {
        const orderedItems = await this.getOrderedItems(order);

        return {
          ...order,
          orderedItems: orderedItems,
        };
      }),
    );

    return ordersObjects;
  }

  async getPaginatedOrdersBy(dto: FindByDto, skip: number, limit: number) {
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
        select:
          '-orders -city -favoriteProducts -role -password -refreshToken -novaPost', // Exclude fields
      })
      .select('-city -novaPost')
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const paginatedOrdersWithImages = await Promise.all(
      paginatedOrders.map(async (order) => {
        const orderedItems = await this.getOrderedItems(order);

        return {
          ...order,
          orderedItems: orderedItems,
        };
      }),
    );

    return paginatedOrdersWithImages;
  }

  getOrderedItems(order: Order): any {
    return Promise.all(
      order.orderedItems.map(async (item) => {
        const orderedItem = item;
        const product = await this.productsService.getProductById(
          orderedItem.product.toString(),
        );

        const dimens = fillAttributes(orderedItem.dimensions, this.attributes);
        return {
          product: orderedItem.product.toString(),
          productName: product.name,
          productPrice: product.salePrice,
          dimensions: dimens,
        };
      }),
    );
  }

  async createOrder(orderDto: CreateOrderDto) {
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
      const dimensionsToSave = product.dimensions.map((e) =>
        convertToDimension(e),
      );
      orderedItems.push({
        product: product._id,
        dimensions: fillAttributes(dimensionsToSave, this.attributes),
      });
    }
    const createdOrder = new this.orderModel({
      ...orderDto,
      client,
      city: orderDto.city,
      novaPost: orderDto.novaPost,
      orderedItems,
    });
    const savedOrder = await createdOrder.save();
    await this.usersService.addOrder(client._id.toString(), createdOrder);
    return this.fillOrderDimensions(savedOrder.toObject());
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

  async changeOrderStatus(
    orderId: string,
    newStatus: Status,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    order.status = newStatus;
    const updatedOrder = await order.save();
    return updatedOrder;
  }

  async deleteOrder(orderId: string) {
    await this.orderModel.findByIdAndDelete(orderId).exec();
  }

  async getOrderById(orderId: string) {
    // Specify the fields you want to include in the 'client' population
    const clientFieldsToInclude =
      'firstName secondName middleName instagram mobileNumber email';

    // Find the order by ID in the database and populate the 'orderedItems.product' field
    const order = await this.orderModel
      .findById(orderId)

      .populate({
        path: 'client', // Populate the 'client' field
        select: clientFieldsToInclude,
      })
      .lean()
      .exec();

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    const orderedItems = await this.getOrderedItems(order);

    return {
      ...order,
      orderedItems: orderedItems,
    };
  }

  async getOrderDocumentById(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return order;
  }

  fillOrderDimensions(order: Order): Order {
    order.orderedItems.forEach((item) => {
      item.dimensions = fillAttributes(item.dimensions, this.attributes);
    });
    return order;
  }
}
