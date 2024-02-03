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
    private ordersService: OrdersService,
  ) {}

  async getProfile(userId: string | null, guestId: string | null) {
    if (guestId) {
      const guestUser = {
        id: guestId,
        firstName: '',
        secondName: '',
        mobileNumber: '',
        role: 'GUEST',
        orders: [],
        favoriteProducts: [],
      };

      return guestUser;
    }
    const user = await this.userModel.findById(userId).populate({
      path: 'favoriteProducts',
      model: 'Product',
      populate: {
        path: 'dimensions.color',
        model: 'Color',
      },
    });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return await user.save();
  }

  async getProfileOrders(
    userId: string | null,
    guestId: string | null,
    skip: number,
    limit: number,
  ) {
    if (guestId) {
      return { profileOrders: [] };
    }
    const orders = await await this.ordersService.getOrdersByUserId(
      userId,
      skip,
      limit,
    );

    return { profileOrders: orders };
  }
}
