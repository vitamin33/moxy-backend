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
import { UsersService } from 'src/users/users.service';
import { OrderDocument } from './order.entity';
import { User } from 'src/users/user.entity';
import { ChangeOrderDto } from './dto/change-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
  ) {}

  async getAllOrders(): Promise<OrderDocument[]> {
    return this.orderModel.find().populate('products').exec();
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
    const resultOrder = await createdOrder.save();
    await this.usersService.addOrder(client._id.toString(), createdOrder);
    return resultOrder;
  }

  async editOrder(orderDto: ChangeOrderDto): Promise<OrderDocument> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      { _id: orderDto.orderId },
      orderDto,
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
