import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { DeliveryType, PaymentType, Status } from '../order.entity';
import { Type } from 'class-transformer';

export class FindByDto {
  @IsOptional()
  @IsEnum(Status, { each: true })
  readonly statuses: Status[];
  @IsOptional()
  @IsEnum(PaymentType, { each: true })
  readonly paymentTypes: PaymentType[];
  @IsOptional()
  @IsEnum(DeliveryType, { each: true })
  readonly deliveryTypes: DeliveryType[];
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly fromDate: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly toDate: Date;
}
