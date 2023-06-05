import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';

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
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  mobileNumber: string;
  firstName: string;
  secondName: string;
  middleName: string;
  novaPostNumber: number;
  city: string;
}
