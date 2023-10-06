import { Transform } from '@nestjs/class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from '@nestjs/class-validator';



export class VerifyConfirmationDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Confirmation code is required' })
  @Length(4, 4, { message: 'Confirmation code should be 4 digits' })
  confirmationCode: string;
}
