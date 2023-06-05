import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class EditUserDto {
  readonly userId: string;
  readonly firstName: string;
  readonly secondName: string;
  readonly middleName: string;
  readonly instagram: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  readonly mobileNumber: string;
  readonly city: string;
  readonly novaPoshtaNumber: number;
  readonly ukrPostNumber: number;
  readonly novaPostMachineNumber: number;
}
