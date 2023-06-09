import { IsEnum, IsNotEmpty } from 'class-validator';
import { Color } from 'src/products/product.entity';

export class DimensionDto {
  @IsEnum(Color)
  @IsNotEmpty()
  readonly color: string;
  @IsNotEmpty()
  readonly quantity: number;
}
