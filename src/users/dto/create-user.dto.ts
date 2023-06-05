import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '0938784738', description: 'Mobile number.' })
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  @IsString({ message: 'Should be string' })
  readonly mobileNumber: string;
  @ApiProperty({ example: 'buba', description: 'Password' })
  @IsString({ message: 'Should be string' })
  @Length(6, 16, { message: 'Wrong length of password' })
  readonly password: string;

  @ApiProperty({ example: 'Vityok', description: 'First name.' })
  @IsString({ message: 'Should be string' })
  readonly firstName: string;
  @ApiProperty({ example: 'Som', description: 'Second name.' })
  @IsString({ message: 'Should be string' })
  readonly secondName: string;
}
