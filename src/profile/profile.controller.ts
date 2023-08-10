import { Controller, Get, Request } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get()
  async getFavoriteProducts(@Request() req: any): Promise<User> {
    const userId = req.user.id;
    return this.profileService.getProfile(userId);
  }
}
