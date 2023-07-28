import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/orders/order.entity';
import {
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../utils';

@Injectable()
export class OrderCountService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async calculateTotalOrdersCount(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrdersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrdersCount: 1,
        },
      },
    ]);

    return result.length > 0 ? result[0].totalOrdersCount : 0;
  }

  // Function to get the previous total orders count for the same time frame as the current period
  async getPreviousTotalOrdersCount(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const { previousFromDate, previousToDate } = getPreviousPeriodDates(
      fromDate,
      toDate,
    );
    return this.calculateTotalOrdersCount(previousFromDate, previousToDate);
  }

  async calculateOrdersCountByTimeFrame(
    fromDate: Date,
    toDate: Date,
    timef: 'day' | 'week' | 'month',
  ): Promise<RangeData[]> {
    const dateField = '$createdAt';

    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: dateField } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const coordinates = result.map((item) => ({
      fromDate: item._id,
      toDate: item._id,
      key: item._id,
      value: item.count,
    }));
    const resultCoordinates = transformToTimeFrameCoordinates(
      coordinates,
      timef,
    );

    return resultCoordinates;
  }
}
