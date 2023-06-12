import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';
import { ProductDto } from './product.dto';

export class ChangeOrderDto {
  @IsNotEmpty({ message: 'orderId should be present' })
  readonly orderId: string;

  @IsEnum(DeliveryType)
  readonly deliveryType: string;
  @IsEnum(Status)
  readonly status: string;
  @IsEnum(PaymentType)
  readonly paymentType: string;
  readonly cashAdvanceValue: number;
  readonly novaPostMachineNumber: number;
  readonly novaPostNumber: number;
  readonly ukrPostNumber: number;
  readonly deliveryCity: string;
  readonly products: ProductDto[];
}
