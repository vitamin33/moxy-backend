import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  readonly userId: string;
  @IsEnum(DeliveryType)
  @IsNotEmpty({ message: 'deliveryType should be present' })
  readonly deliveryType: string;
  @IsEnum(Status)
  readonly status: string;
  @IsEnum(PaymentType)
  @IsNotEmpty({ message: 'paymentType should be present' })
  readonly paymentType: string;
  readonly cashAdvanceValue: number;
  readonly novaPostMachineNumber: number;
  readonly novaPostNumber: number;
  readonly ukrPostNumber: number;
  readonly deliveryCity: string;
  @ArrayNotEmpty({ message: 'Order should have at least one product.' })
  readonly products: string[];
  readonly client: GuestUserDto;
}

export class GuestUserDto {
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
  mobileNumber: string;
  firstName: string;
  secondName: string;
  middleName: string;
  novaPostNumber: number;
  city: string;
}
