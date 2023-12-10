import { IsEnum } from 'class-validator';
import { MediaType } from '../media.entity';

export class AddMediaDto {
  @IsEnum(MediaType)
  type: string;
}
