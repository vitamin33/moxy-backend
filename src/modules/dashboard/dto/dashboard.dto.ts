import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class DashboardDto {
  @Type(() => Date)
  @IsDate()
  readonly fromDate: Date;
  @Type(() => Date)
  @IsDate()
  readonly toDate: Date;
}

export class ProductStatsDto {
  @Type(() => Date)
  @IsDate()
  readonly fromDate: Date;
  @Type(() => Date)
  @IsDate()
  readonly toDate: Date;
}
