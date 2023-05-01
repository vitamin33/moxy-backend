import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.entity';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from 'src/users/users.service';
import { OrderDocument } from './order.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
  ) {}

  async getAllOrders(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .populate('client')
      .populate('products')
      .exec();
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
      client = await this.usersService.createGuestUser(orderDto.client);
    }
    const createdOrder = new this.orderModel({
      ...orderDto,
      client,
    });
    await createdOrder.populate('products');
    return createdOrder.save();
  }
}
