import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Color } from '../product.entity';
import { Type } from 'class-transformer';

export class DimensionDto {
  @IsEnum(Color)
  @IsNotEmpty()
  color: string;
  @IsInt()
  @Min(0)
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
  @IsNumber()
  @Min(0)
  costPrice: number;
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];
}
