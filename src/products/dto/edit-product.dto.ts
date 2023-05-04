import { IsEnum } from 'class-validator';
import { Color } from '../product.entity';

export class EditProductDto {
  readonly name: string;
  readonly description: string;
  readonly costPrice: number;
  readonly salePrice: number;
  readonly warehouseQuantity: number;
  @IsEnum(Color)
  readonly color: string;
  readonly currentImages: string[];
}
