import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get()
  async getProfile(@Request() req: any): Promise<User> {
    const userId = req.user.id;
    return this.profileService.getProfile(userId);
  }
}
