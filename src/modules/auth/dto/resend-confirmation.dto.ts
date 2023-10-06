import { IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class ResendConfirmationDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
