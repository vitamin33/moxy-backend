import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Color } from '../product.entity';
import { Type } from 'class-transformer';

export class DimensionDto {
  @IsEnum(Color)
  @IsNotEmpty()
  color: string;
  @IsNotEmpty()
  quantity: number;
}

export class CreateProductDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  idName: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  costPrice: number;
  @IsNotEmpty()
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];
}
