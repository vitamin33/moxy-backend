import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { City, DeliveryType, PaymentType, Status } from '../order.entity';
import { Transform } from 'class-transformer';
import { ProductDto } from './product.dto';
import { CashAdvanceValue } from 'src/common/validator/cash-advance.validator';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @CashAdvanceValue()
  @ValidateIf((object, _) => object.paymentType === PaymentType.CashAdvance)
  @IsNotEmpty({ message: 'cashAdvanceValue should be present' })
  @Min(1, { message: 'cashAdvanceValue should be greater than 0' })
  readonly cashAdvanceValue: number;
  readonly novaPost: NovaPostDto;
  readonly ukrPostInfo: string;
  readonly city: CityDto;
  @ArrayNotEmpty({ message: 'Order should have at least one product.' })
  readonly products: ProductDto[];
  readonly client: GuestUserDto;
}

export class CityDto {
  ref: string;
  presentName: string;
  mainDescription: string;
  deliveryCityRef: string;
}

export class NovaPostDto {
  ref: string;
  presentName: string;
  number: number;
  postMachineType: string;
}

export class GuestUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[+0-9])?[0-9]{10,14}$/, {
    message: 'Mobile number with wrong format.',
  })
  @Transform(({ value }) => {
    if (value.length == 13) {
      return value.substring(3);
    } else if (value.length == 14) {
      value.substring(4);
    } else if (value.length == 12) {
      value.substring(2);
    } else if (value.length == 11) {
      value.substring(1);
    }
    return value;
  })
  mobileNumber: string;
  firstName: string;
  secondName: string;
  middleName: string;
  novaPostNumber: number;
  city: City;
}
