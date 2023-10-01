import { IsNotEmpty } from 'class-validator';

export class ProductAttributesDto {
  @IsNotEmpty()
  weightInGrams: number;
  season: string;
  furniture: string;
  strap: string;

  @IsNotEmpty()
  heightInCm: number;

  @IsNotEmpty()
  widthInCm: number;

  @IsNotEmpty()
  lengthInCm: number;
  depthInCm: number;
  producer: string;
}
