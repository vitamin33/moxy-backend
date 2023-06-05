import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GuestUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  mobileNumber: string;
  firstName: string;
  secondName: string;
  instagram: string;
  city: string;
}
