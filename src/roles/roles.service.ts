import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './role.entity';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}
  async createRole(dto: CreateRoleDto) {
    const role = new this.roleModel(dto);
    return role.save();
  }

  async getRoleByValue(value: string) {
    const role = await this.roleModel.findOne({ name: value });
    return role;
  }
}
