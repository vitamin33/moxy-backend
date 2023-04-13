import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel(dto);
    const role = await this.roleService.getRoleByValue('USER');
    user.$set('role', role);
    return user.save();
  }

  async getAllUsers() {
    return this.userModel.find().populate('role').exec();
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email }).populate('role');
  }
}
