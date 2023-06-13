import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Order } from 'src/orders/order.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { GuestUserDto } from './dto/guest-user.dto';
import { NovaPoshtaService } from 'src/nova-poshta/nova-poshta.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private roleService: RolesService,
    private novaPoshtaService: NovaPoshtaService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel(dto);
    const role = await this.roleService.getRoleByValue('ADMIN');
    user.$set('role', role);
    return await user.save();
  }

  async createGuestUser(dto: GuestUserDto): Promise<User> {
    const client = await this.getUserByMobileNumber(dto.mobileNumber);
    if (!client) {
      const user = new this.userModel(dto);
      const role = await this.roleService.getRoleByValue('GUEST');
      user.$set('role', role);
      return await user.save();
    } else {
      throw new HttpException(
        'User with such mobile number already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllUsers() {
    return this.userModel.find().populate('role').populate('orders').exec();
  }

  async addRole(dto: ChangeRoleDto) {
    const role = await this.roleService.getRoleByValue(dto.name);
    const user = await this.getUserById(dto.userId);
    if (role && user) {
      await this.userModel.findByIdAndUpdate(
        dto.userId,
        { $set: { role: { _id: role._id } } },
        { new: true },
      );
    } else {
      throw new HttpException(
        'Unable to find such Role or User',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async editUser(dto: EditUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: dto.userId },
      dto,
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User #${dto.userId} not found`);
    }
    return updatedUser;
  }

  async addOrder(userId: string, order: Order) {
    const user = await this.getUserById(userId);
    if (user) {
      user.orders.push(order);
      return await user.save();
    } else {
      throw new HttpException(
        `Unable to find such User: ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async parseNovaPoshtaClients(): Promise<User[]> {
    const users = await this.novaPoshtaService.parseNovaPoshtaClients();
    for (const user of users) {
      const guestUser = new GuestUserDto();
      guestUser.firstName = user.firstName;
      guestUser.secondName = user.secondName;
      guestUser.mobileNumber = user.mobileNumber;
      this.createGuestUser(guestUser);
    }
    return users;
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email }).populate('role').exec();
  }
  async getUserByMobileNumber(number: string) {
    return this.userModel
      .findOne({ mobileNumber: number })
      .populate('role')
      .exec();
  }
  async getUserById(id: string) {
    return this.userModel.findOne({ _id: id }).populate('role').exec();
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    await this.userModel.updateOne({ _id: userId }, { refreshToken }).exec();
  }
}
