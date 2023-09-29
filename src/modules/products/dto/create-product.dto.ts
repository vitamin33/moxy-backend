import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { MatchArrayLength } from 'src/common/validator/match-array-length.validator';
import { DimensionDto } from 'src/common/dto/dimension.dto';

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
  weightInGrams: number;
  @IsNotEmpty()
  salePrice: number;

  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];

  @Exclude()
  numberOfImagesForDimensions: number[];
}
