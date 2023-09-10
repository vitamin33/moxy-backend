import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() userDto: CreateUserDto) {
    return this.authService.login(userDto);
  }

  @Post('/register')
  @UsePipes(ValidationPipe)
  register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Post('/refresh-token')
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-password')
  @UsePipes(ValidationPipe)
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.id;
    try {
      // Verify the old password
      const isPasswordValid = await this.authService.validatePassword(
        userId,
        dto.oldPassword,
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
      }

      // Change the password
      await this.authService.changePassword(userId, dto.newPassword);

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
