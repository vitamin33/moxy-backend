import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { ProductAttributesDto } from './attributes.dto';

export class EditProductDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  idName: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  costPriceInUsd: number;

  @IsNotEmpty()
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];

  numberOfImagesForDimensions: number[];

  @Type(() => ProductAttributesDto)
  @ValidateNested()
  attributes: ProductAttributesDto;

  @IsNotEmpty()
  category: string;
}
