import { IsEnum } from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';

export class CreateOrderDto {
  readonly userId: string;
  @IsEnum(DeliveryType)
  readonly deliveryType: string;
  @IsEnum(Status)
  readonly status: string;
  @IsEnum(PaymentType)
  readonly paymentType: string;
  readonly cashAdvanceValue: number;
  readonly novaPostMachineNumber: number;
  readonly novaPostNumber: number;
  readonly deliveryCity: string;
  readonly products: string[];
  readonly client: GuestUserDto;
}

export class GuestUserDto {
  readonly mobileNumber: number;
  readonly firstName: string;
  readonly secondName: string;
  readonly middleName: string;
  readonly novaPostNumber: number;
  readonly city: string;
}
