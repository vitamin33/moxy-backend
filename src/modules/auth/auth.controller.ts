import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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
}
