import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeFrameService {
  calculateTimeFrame(fromDate: Date, toDate: Date): 'day' | 'week' | 'month' {
    const dateRangeInDays =
      Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dateRangeInDays <= 32) {
      return 'day';
    } else if (dateRangeInDays <= 90) {
      return 'week';
    } else {
      return 'month';
    }
  }
}
