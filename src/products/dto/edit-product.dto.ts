import { IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { DimensionDto } from './create-product.dto';
import { Type } from 'class-transformer';

export class EditProductDto {
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
  readonly currentImages: string[];
}
