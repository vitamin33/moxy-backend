import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '0938784738', description: 'Mobile number.' })
  @IsNotEmpty()
  @Matches(/^(?:[+0-9])?[0-9]{10,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  @Transform(({ value }) => {
    if (value.length == 13) {
      return value.substring(3);
    } else if (value.length == 14) {
      value.substring(4);
    } else if (value.length == 12) {
      value.substring(2);
    } else if (value.length == 11) {
      value.substring(1);
    }
    return value;
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

  @ApiProperty({ example: 'some@mail.com', description: 'Email' })
  @IsEmail()
  readonly email: string;

  confirmationCode?: string;
}
