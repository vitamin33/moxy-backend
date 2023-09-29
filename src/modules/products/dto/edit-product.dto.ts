import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { MatchArrayLength } from 'src/common/validator/match-array-length.validator';

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
  weightInGrams: number;
  @IsNotEmpty()
  salePrice: number;
  @Type(() => DimensionDto)
  @ValidateNested()
  dimensions: DimensionDto[];

  numberOfImagesForDimensions: number[];
}
