import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetNewPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  resetToken: string;
}
