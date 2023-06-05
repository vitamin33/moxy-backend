import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }
  private async validateUser(userDto: CreateUserDto): Promise<User> {
    const user = await this.userService.getUserByMobileNumber(
      userDto.mobileNumber,
    );
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (user && passwordEquals) {
      return user;
    } else {
      throw new UnauthorizedException({
        message: 'Wrong password or mobile number.',
      });
    }
  }

  async register(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByMobileNumber(
      userDto.mobileNumber,
    );
    if (candidate) {
      throw new HttpException(
        'User with such mobile number is already registered',
        HttpStatus.CONFLICT,
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload = {
      mobileNumber: user.mobileNumber,
      id: user._id,
      role: user.role,
    };
    return {
      token: this.jwtService.sign(payload),
      userId: user._id,
    };
  }
}
