import { DimensionDto } from 'src/common/dto/dimension.dto';

export class ProductDto {
  readonly _id: string;
  readonly dimensions: DimensionDto[];
}
