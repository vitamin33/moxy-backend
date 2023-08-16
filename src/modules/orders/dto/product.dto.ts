import { DimensionDto } from './dimension.dto';

export class ProductDto {
  readonly _id: string;
  readonly dimensions: DimensionDto[];
}
