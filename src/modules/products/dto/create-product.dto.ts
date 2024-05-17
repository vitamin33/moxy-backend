import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { ProductAttributesDto } from './attributes.dto';
import { ProductCategory } from '../product.entity';
import { PlaceProduction } from '../place-production.entity';

export class CreateProductDto {
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

  @Exclude()
  numberOfImagesForDimensions: number[];

  @Type(() => ProductAttributesDto)
  @ValidateNested()
  attributes: ProductAttributesDto;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: string;

  @IsNotEmpty()
  @IsEnum(PlaceProduction)
  placeProduction: string;
}
