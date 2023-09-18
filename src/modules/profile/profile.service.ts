import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { User, UserDocument } from 'src/modules/users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
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

  async getProfileOrders(userId: string) {
    const user = await await this.usersService.getUserByIdWithOrders(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return { profileOrders: user.orders };
  }
}
