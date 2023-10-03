import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ProductAttributesDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  weightInGrams: string;
  season: string;
  furniture: string;
  strap: string;

  @IsNotEmpty()
  heightInCm: string;

  @IsNotEmpty()
  widthInCm: string;

  @IsNotEmpty()
  lengthInCm: string;
  depthInCm: string;
  producer: string;
}
