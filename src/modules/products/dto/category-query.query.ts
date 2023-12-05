import { IsEnum, IsOptional } from 'class-validator';
import { ProductCategory } from '../product.entity';

export class GetSellingProductsQuery {
  @IsOptional()
  @IsEnum(ProductCategory, { message: 'Invalid category value' })
  category?: ProductCategory;
}
