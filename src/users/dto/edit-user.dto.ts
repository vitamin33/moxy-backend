import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class EditUserDto {
  readonly userId: string;
  readonly firstName: string;
  readonly secondName: string;
  readonly middleName: string;
  readonly instagram: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[+0-9])?[0-9]{10,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  @Transform(({ value }) => {
    if (value.length() == 13) {
      return value.substring(3);
    } else if (value.length() == 14) {
      value.substring(4);
    } else if (value.length() == 12) {
      value.substring(2);
    } else if (value.length() == 11) {
      value.substring(1);
    }
    return value;
  })
  readonly mobileNumber: string;
  readonly city: string;
  readonly novaPoshtaNumber: number;
  readonly ukrPostNumber: number;
  readonly novaPostMachineNumber: number;
}
