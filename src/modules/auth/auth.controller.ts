import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Request,
  HttpException,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { UsersService } from '../users/users.service';
import { VerifyConfirmationDto } from './dto/verify-confirmation.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { Roles } from './role-auth.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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

  @Post('/guest-token')
  guestToken() {
    return this.authService.generateGuestToken();
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

  @Post('/resend-confirmation')
  async resendConfirmationCode(@Body() resendDto: ResendConfirmationDto) {
    await this.authService.resendConfirmationCode(resendDto);

    return { message: 'Confirmation code resent successfully' };
  }

  @Post('/verify-confirmation')
  async verifyConfirmationCode(@Body() verifyDto: VerifyConfirmationDto) {
    await this.authService.verifyConfirmationCode(verifyDto);

    return { message: 'User registration confirmed successfully' };
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.requestPasswordReset(resetPasswordDto.email);
    return { message: 'Password reset email sent successfully' };
  }

  @Post('/new-password')
  @UsePipes(ValidationPipe)
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    const { email, newPassword, resetToken } = dto;
    await this.authService.setNewPassword(email, newPassword, resetToken);
    return { message: 'Password changed successfully' };
  }

  @Delete('user/:id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteUser(@Param('id') id: string) {
    await this.authService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
