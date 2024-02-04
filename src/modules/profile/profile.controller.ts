import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/modules/users/user.entity';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly newsletterService: NewsletterService,
  ) {}
  @Get()
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    const guestId = req.guestId;
    return this.profileService.getProfile(userId, guestId);
  }

  @Get('orders')
  async getProfileOrders(
    @Request() req: any,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 50,
  ) {
    const userId = req.user.id;
    const guestId = req.guestId;
    const result = await this.profileService.getProfileOrders(
      userId,
      guestId,
      skip,
      limit,
    );
    return result;
  }

  @Post('subscribe')
  async subscribeToNewsletter(
    @Body('email') email: string,
    @Body('firstName') firstName: string,
  ) {
    const subscription = await this.newsletterService.subscribeToNewsletter(
      email,
      firstName,
    );
    return subscription;
  }
}
