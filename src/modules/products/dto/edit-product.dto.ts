import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { ProductAttributesDto } from './attributes.dto';
import { PlaceProduction } from '../place-production.entity';

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
  costPrice: number;


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

  @IsNotEmpty()
  @IsEnum(PlaceProduction)
  placeProduction: string;
}
