import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.entity';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { GuestUserDto as UserDto } from 'src/users/dto/guest-user.dto';
import { UsersService } from 'src/users/users.service';
import { OrderDocument } from './order.entity';
import { User } from 'src/users/user.entity';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FindByDto } from './dto/find-by.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async getAllOrders(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .populate('products')
      .populate('client')
      .exec();
  }

  async getOrdersBy(dto: FindByDto): Promise<OrderDocument[]> {
    const query = this.orderModel.find();
    if (dto.statuses) {
      query.all('status', dto.statuses);
    }
    if (dto.paymentTypes) {
      query.all('paymentType', dto.paymentTypes);
    }
    if (dto.deliveryTypes) {
      query.all('deliveryType', dto.deliveryTypes);
    }
    if (dto.fromDate) {
      const fromDate = new Date(dto.fromDate).toISOString();
      query.gte('updatedAt', fromDate);
    }
    if (dto.toDate) {
      const toDate = new Date(dto.toDate).toISOString();
      query.lte('updatedAt', toDate);
    }
    return query.populate('products').exec();
  }

  async createOrder(orderDto: CreateOrderDto): Promise<OrderDocument> {
    let client: User;
    if (orderDto.userId) {
      client = await this.usersService.getUserById(orderDto.userId);
      if (!client) {
        throw new HttpException(
          'User with such userId does not exist',
          HttpStatus.BAD_REQUEST,
        );
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
        dto.city = orderDto.client.city;
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
      orderedItems,
    });
    const resultOrder = await createdOrder.save();
    await this.usersService.addOrder(client._id.toString(), createdOrder);
    return resultOrder;
  }

  async editOrder(orderDto: ChangeOrderDto): Promise<OrderDocument> {
    const orderedItems = [];
    for (const product of orderDto.products) {
      orderedItems.push({
        product: product._id,
        dimensions: product.dimensions,
      });
    }
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      { _id: orderDto.orderId },
      { ...orderDto, orderedItems },
      { new: true },
    );

    if (!updatedOrder) {
      throw new NotFoundException(`Order #${orderDto.orderId} not found`);
    }
    return updatedOrder;
  }

  async getOrderById(id: string) {
    return this.orderModel
      .findOne({ _id: id })
      .populate('products')
      .populate('client')
      .exec();
  }
}
