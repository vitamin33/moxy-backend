import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';
import { ProductDto } from './product.dto';
import { CityDto, NovaPostDto } from './create-order.dto';

export class ChangeOrderDto {
  @IsNotEmpty({ message: 'orderId should be present' })
  readonly orderId: string;

  @IsOptional()
  @IsEnum(DeliveryType)
  readonly deliveryType: string;
  @IsOptional()
  @IsEnum(Status)
  readonly status: string;
  @IsOptional()
  @IsEnum(PaymentType)
  readonly paymentType: string;
  @IsOptional()
  readonly cashAdvanceValue: number;
  @IsOptional()
  readonly novaPost: NovaPostDto;
  @IsOptional()
  readonly ukrPostNumber: number;
  @IsOptional()
  readonly city: CityDto;
  @IsOptional()
  products: ProductDto[];
}
