import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.entity';

@Injectable()
export class ProfileService {
  @InjectModel(User.name) private userModel: Model<UserDocument>;
  async getProfile(userId: any) {
    return new this.userModel();
  }
}
