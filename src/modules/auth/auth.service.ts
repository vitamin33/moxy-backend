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
import { ResendConfirmationDto } from './dto/resend-confirmation.dto';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { VerifyConfirmationDto } from './dto/verify-confirmation.dto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { ResetPasswordDto } from './dto/reset-password.dto';

class LoginResponse {
  accessToken: string;
  refreshToken?: string;
  userRole: string;
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
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
    const emailCandidate = await this.userService.getUserByEmail(userDto.email);

    if (candidate || emailCandidate) {
      const role = candidate.role;

      if (candidate.role.name !== 'GUEST') {
        throw new HttpException(
          'User with such mobile number or email is already registered',
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
      const confirmationCode = this.generateConfirmationCode();
      const hashPassword = await bcrypt.hash(userDto.password, 5);
      const user = await this.userService.createUser({
        ...userDto,
        password: hashPassword,
        confirmationCode,
      });
      this.sendConfirmationMail(user.email, confirmationCode);

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

  private generateAccessToken(
    user: User,
    guestId: string | null = null,
  ): string {
    const isGuest = guestId != null;
    const payload = {
      mobileNumber: isGuest ? null : user.mobileNumber,
      id: isGuest ? guestId : user._id,
      role: isGuest ? { name: 'GUEST' } : user.role,
      isGuest: isGuest,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  async generateGuestToken() {
    const guestId = uuid();
    const accessToken = this.generateAccessToken(null, guestId);
    return {
      userId: guestId,
      accessToken: accessToken,
      userRole: 'GUEST',
    };
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      id: userId,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '90d',
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

  async setNewPassword(email: string, newPassword: string, resetToken: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UserNotFoundException(email);
      }
      if (user.resetPasswordToken !== resetToken) {
        throw new HttpException('Invalid reset token', HttpStatus.BAD_REQUEST);
      }

      // Reset the user's password to the new password
      const hashedPassword = await bcrypt.hash(newPassword, 5);
      user.password = hashedPassword;

      // Clear the reset token field
      user.resetPasswordToken = undefined;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException(`Email: ${email}`);
    }
    // Generate a reset token (a random string)
    const resetToken = uuid();

    // Store the reset token in the user's record in the database
    user.resetPasswordToken = resetToken;
    await user.save();

    // Send an email to the user with a link to reset their password
    await this.sendPasswordResetEmail(user.email, resetToken);
  }
  async sendPasswordResetEmail(receiverMail: string, resetToken: string) {
    await this.setTransport();
    const mainEmail = this.configService.get<string>('MAIN_EMAIL');
    const newPasswordUrl = this.configService.get<string>(
      'FRONTEND_NEW_PASSWORD_URL',
    );
    const rootDir = process.cwd();
    const templatePath = `${rootDir}/templates/reset-password.html`;
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    const resetLink = `${newPasswordUrl}?email=${receiverMail}&token=${resetToken}`;

    // Replace placeholders with data
    const html = template({ resetLink: resetLink });
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to: receiverMail,
        from: mainEmail, // sender address
        subject: 'MOXY Reset Password',
        html: html,
        context: {
          resetLink: resetLink,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, newPassword, resetToken } = resetPasswordDto;
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UserNotFoundException(`Email: ${email}`);
    }

    // Verify that the reset token matches the one stored in the user's record
    if (user.resetPasswordToken !== resetToken) {
      throw new HttpException('Invalid reset token', HttpStatus.BAD_REQUEST);
    }

    // Reset the user's password to the new password
    const hashedPassword = await bcrypt.hash(newPassword, 5);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    await user.save();
  }

  async resendConfirmationCode(resendDto: ResendConfirmationDto) {
    const user = await this.userService.getUserByEmail(resendDto.email);
    if (!user) {
      throw new UserNotFoundException(`Phone number: ${resendDto.email}`);
    }

    if (user.isConfirmed) {
      throw new HttpException(
        'User is already confirmed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const confirmationCode = this.generateConfirmationCode();
    user.confirmationCode = confirmationCode; // Update the code
    await user.save();

    this.sendConfirmationMail(resendDto.email, confirmationCode);
  }

  async verifyConfirmationCode(verifyDto: VerifyConfirmationDto) {
    const user = await this.userService.getUserByEmail(verifyDto.email);
    if (!user) {
      throw new UserNotFoundException(`Email: ${verifyDto.email}`);
    }

    if (user.isConfirmed) {
      throw new HttpException(
        'User is already confirmed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.confirmationCode !== verifyDto.confirmationCode) {
      throw new HttpException(
        'Invalid confirmation code',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Mark the user as confirmed
    user.isConfirmed = true;
    user.confirmationCode = undefined; // Clear the confirmation code
    await user.save();
  }

  async sendConfirmationMail(receiverMail: string, verificationCode: string) {
    await this.setTransport();
    const mainEmail = this.configService.get<string>('MAIN_EMAIL');
    const rootDir = process.cwd();
    const templatePath = `${rootDir}/templates/verification.html`;
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);

    // Replace placeholders with data
    const html = template({ code: verificationCode });
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to: receiverMail,
        from: mainEmail, // sender address
        subject: 'MOXY Verficiaction Code',
        html: html,
        context: {
          code: verificationCode,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  generateConfirmationCode(): string {
    const min = 1000; // Minimum 4-digit number
    const max = 9999; // Maximum 4-digit number
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code.toString(); // Convert to string
  }

  private async setTransport() {
    const clientId = this.configService.get<string>('GOOGLE_SMTP_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_SMTP_CLIENT_SECRET',
    );
    const refreshToken = this.configService.get<string>(
      'GOOGLE_SMTP_REFRESH_TOKEN',
    );
    const mainEmail = this.configService.get<string>('MAIN_EMAIL');
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error('Error getting access token:', err.message);
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: mainEmail,
        clientId: clientId,
        clientSecret: clientSecret,
        accessToken,
      },
    };
    this.mailerService.addTransporter('gmail', config);
  }
}
