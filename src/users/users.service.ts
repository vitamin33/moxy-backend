import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel(dto);
    const role = await this.roleService.getRoleByValue('MANAGER');
    user.$set('role', role);
    return await user.save();
  }

  async getAllUsers() {
    return this.userModel.find().populate('role').exec();
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

  async removeRole(dto: ChangeRoleDto) {
    throw new Error('Method not implemented.');
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email }).populate('role').exec();
  }
  async getUserById(id: string) {
    return this.userModel.findOne({ _id: id }).populate('role').exec();
  }
}
