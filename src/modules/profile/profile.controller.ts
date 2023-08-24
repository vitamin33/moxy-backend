import {
  Controller,
  Get,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseInterceptors(CacheInterceptor)
  @Get()
  async getProfile(@Request() req: any): Promise<User> {
    const userId = req.user.id;
    return this.profileService.getProfile(userId);
  }
}
