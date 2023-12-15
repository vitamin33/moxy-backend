import { IsEnum, IsOptional } from 'class-validator';
import { MediaType } from '../media.entity';

export class AddMediaDto {
  @IsEnum(MediaType)
  type: string;

  @IsOptional()
  productId?: string;
}
