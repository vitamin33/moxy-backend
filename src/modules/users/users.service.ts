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
import { RolesService } from 'src/modules/roles/roles.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Order } from 'src/modules/orders/order.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { GuestUserDto } from './dto/guest-user.dto';
import { NovaPoshtaService } from 'src/modules/nova-poshta/nova-poshta.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { FavoritesService } from '../favorites/favorites.service';
import { Product } from 'src/modules/products/product.entity';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private roleService: RolesService,
    private novaPoshtaService: NovaPoshtaService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel(dto);
    const role = await this.roleService.getRoleByValue('USER');
    user.$set('role', role);
    return await user.save();
  }

  async createGuestUser(
    dto: GuestUserDto,
    skipErrors: boolean = false,
  ): Promise<User> {
    const client = await this.getUserByMobileNumber(dto.mobileNumber);
    if (!client) {
      const user = new this.userModel(dto);
      const role = await this.roleService.getRoleByValue('GUEST');
      user.$set('role', role);
      return await user.save();
    } else if (!skipErrors) {
      throw new HttpException(
        'User with such mobile number already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUserRole(
    userId: string,
    password: string,
    roleName: string,
  ): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (user.role.name !== 'GUEST') {
      throw new HttpException(
        'Only guest users can be updated',
        HttpStatus.BAD_REQUEST,
      );
    }

    // update user role
    const dto = new ChangeRoleDto();
    dto.name = roleName;
    dto.userId = userId;
    this.addRole(dto);

    user.password = password;

    return await user.save();
  }

  async getAllUsers() {
    return await this.userModel
      .find()
      .populate('role')
      .populate('orders')
      .exec();
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
      throw new UserNotFoundException(dto.userId);
    }
    return updatedUser;
  }

  async deleteUserById(userId: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    if (result.deletedCount === 0) {
      throw new UserNotFoundException(userId);
    }
  }

  async addOrder(userId: string, order: Order) {
    const user = await this.getUserById(userId);
    if (user) {
      user.orders.push(order);
      return await user.save();
    } else {
      throw new UserNotFoundException(userId);
    }
  }

  async changePassword(userId: string, hashedPassword: string) {
    await this.userModel
      .updateOne({ _id: userId }, { password: hashedPassword })
      .exec();
  }

  async parseNovaPoshtaClients(): Promise<User[]> {
    const users = await this.novaPoshtaService.parseNovaPoshtaClients();
    for (const user of users) {
      const guestUser = new GuestUserDto();
      guestUser.firstName = user.firstName;
      guestUser.secondName = user.secondName;
      guestUser.mobileNumber = user.mobileNumber;
      this.createGuestUser(guestUser, true);
    }
    return users;
  }

  async exportUsersToExcel(res: Response): Promise<void> {
    const users = await this.userModel.find().lean().exec();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Set the header row
    worksheet.addRow([
      'First Name',
      'Second Name',
      'Mobile Number',
      'City',
      'Instagram',
    ]);

    for (const user of users) {
      worksheet.addRow([
        user.firstName,
        user.secondName,
        user.mobileNumber,
        user.city,
        user.instagram,
      ]);
    }

    // Set the response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
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

  async getUserByIdWithOrders(id: string) {
    const user = this.userModel
      .findOne({ _id: id })
      .populate({
        path: 'orders',
        populate: {
          path: 'orderedItems.product',
          model: 'Product',
          select: '-dimensions',
        },
      })
      .lean()
      .exec();

    return user;
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    await this.userModel.updateOne({ _id: userId }, { refreshToken }).exec();
  }
}
