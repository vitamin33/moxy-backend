import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ProductAttributesDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  weightInGrams: number;
  season: string;
  furniture: string;
  strap: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  heightInCm: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  widthInCm: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  lengthInCm: number;
  @Transform(({ value }) => parseInt(value))
  depthInCm: number;
  producer: string;
}
