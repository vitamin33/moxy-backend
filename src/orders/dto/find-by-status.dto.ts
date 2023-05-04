import { ArrayNotEmpty, IsEnum } from 'class-validator';
import { Status } from '../order.entity';

export class FindByStatusesDto {
  @ArrayNotEmpty({ message: 'statuses field should have at least one status.' })
  @IsEnum(Status, { each: true })
  readonly statuses: Status[];
}
