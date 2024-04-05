import { IsEmail, IsOptional } from 'class-validator';

export class SubscribeDto {
  @IsEmail()
  readonly email: string;
  @IsOptional()
  readonly firstName: string;
}
