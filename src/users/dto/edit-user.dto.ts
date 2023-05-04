import { IsMobilePhone } from 'class-validator';

export class EditUserDto {
  readonly userId: string;
  readonly firstName: string;
  readonly secondName: string;
  readonly middleName: string;
  readonly instagramLink: string;
  @IsMobilePhone()
  readonly mobileNumber: number;
  readonly city: string;
  readonly novaPoshtaNumber: number;
  readonly novaPostMachineNumber: number;
}
