import { ValidateNested } from 'class-validator';
import { DimensionDto } from './create-product.dto';
import { Type } from 'class-transformer';

export class EditProductDto {
  name: string;
  idName: string;
  description: string;
  costPrice: number;
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];
  readonly currentImages: string[];
}
