import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/modules/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    await this.userService.storeRefreshToken(user.id, refreshToken);

    return {
      userId: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      userRole: user.role.name,
    };
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
      throw new UnauthorizedException('Wrong password or mobile number.');
    }
  }

  async register(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByMobileNumber(
      userDto.mobileNumber,
    );

    if (candidate) {
      if (candidate.role.name !== 'GUEST') {
        throw new HttpException(
          'User with such mobile number is already registered',
          HttpStatus.CONFLICT,
        );
      } else {
        // Update existing guest user to a regular user
        const updatedUser = await this.userService.updateUserRole(
          candidate.id,
          await bcrypt.hash(userDto.password, 5),
          'USER',
        );

        const accessToken = this.generateAccessToken(updatedUser);
        const refreshToken = this.generateRefreshToken(updatedUser.id);

        await this.userService.storeRefreshToken(updatedUser.id, refreshToken);

        return {
          accessToken: accessToken,
          refreshToken: refreshToken,
          userRole: updatedUser.role.name,
        };
      }
    } else {
      // Create a new user
      const hashPassword = await bcrypt.hash(userDto.password, 5);
      const user = await this.userService.createUser({
        ...userDto,
        password: hashPassword,
      });

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user.id);

      await this.userService.storeRefreshToken(user.id, refreshToken);

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userRole: user.role.name,
      };
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      mobileNumber: user.mobileNumber,
      id: user._id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      id: userId,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '30d',
    });
  }

  async refreshToken(refreshToken: string) {
    // Verify the refresh token and retrieve the user
    const user = await this.verifyRefreshToken(refreshToken);

    // Generate a new access token
    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<User> {
    try {
      // Verify and decode the refresh token
      const payload: any = this.jwtService.verify(refreshToken);
      // Check if the refresh token has expired
      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Expired refresh token');
      }

      // TODO: Retrieve the user based on the payload data (e.g., user ID)
      const user = await this.userService.getUserById(payload.id);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      return false; // User not found
    }

    return bcrypt.compare(password, user.password);
  }

  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 5);

    // Update the user's password in the database
    await this.userService.changePassword(userId, hashedPassword);
  }
}
