import { IsEnum, ValidateNested } from 'class-validator';
import { Color } from '../product.entity';
import { Type } from 'class-transformer';

export class DimensionDto {
  @IsEnum(Color)
  color: string;
  quantity: number;
}

export class CreateProductDto {
  name: string;
  idName: string;
  description: string;
  costPrice: number;
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];
}
