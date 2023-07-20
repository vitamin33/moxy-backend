import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class DashboardDto {
  @IsNotEmpty({ message: 'userId should be present' })
  readonly userId: string;
  @Type(() => Date)
  @IsDate()
  readonly fromDate: Date;
  @Type(() => Date)
  @IsDate()
  readonly toDate: Date;
}
