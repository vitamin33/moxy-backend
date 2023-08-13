import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductDto } from 'src/orders/dto/product.dto';
import { Color } from 'src/products/product.entity';

export class AddOrChangeProductDto {
  readonly product: BasketItemDto;
  readonly client: GuestUserDto;
}

export class BasketItemDto {
  readonly productId: string;
  readonly dimension: DimensionDto;
}

export class DimensionDto {
  @IsEnum(Color)
  @IsNotEmpty()
  readonly color: string;
  @IsNotEmpty()
  readonly quantity: number;
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
  city: string;
}
