import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'crazyded@gmail.com', description: 'Email' })
  @IsString({ message: 'Should be string' })
  @IsEmail({}, { message: 'Wrong email format' })
  readonly email: string;
  @ApiProperty({ example: 'buba', description: 'Password' })
  @IsString({ message: 'Should be string' })
  @Length(6, 16, { message: 'Wrong length of password' })
  readonly password: string;
}
