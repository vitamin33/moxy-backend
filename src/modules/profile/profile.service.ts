import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { User, UserDocument } from 'src/modules/users/user.entity';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
    private ordersService: OrdersService,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await (
      await this.userModel.findById(userId)
    ).populate('orders');

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return await user.save();
  }

  async getProfileOrders(userId: string, skip: number, limit: number) {
    const orders = await await this.ordersService.getOrdersByUserId(
      userId,
      skip,
      limit,
    );

    return { profileOrders: orders };
  }
}
