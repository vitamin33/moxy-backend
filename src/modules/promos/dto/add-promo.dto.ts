import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class AddPromoDto {
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  title: string;

  @IsNumber()
  discount: number;

  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly finalDate: Date;
}
