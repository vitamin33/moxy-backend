import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/orders/order.entity';
import {
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../utils';

@Injectable()
export class SaleCalculationService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}
  async calculateTotalSaleValue(fromDate: Date, toDate: Date): Promise<number> {
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
        $unwind: '$orderedItems',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orderedItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $addFields: {
          saleValue: {
            $reduce: {
              input: '$orderedItems.dimensions',
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $multiply: ['$$this.quantity', '$productInfo.salePrice'],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleValue: { $sum: '$saleValue' },
        },
      },
      {
        $project: {
          _id: 0,
          totalSaleValue: 1,
        },
      },
    ]);
    return result.length > 0 ? result[0].totalSaleValue : 0;
  }

  // Function to get the previous total sale value for the same time frame as the current period
  async getPreviousTotalSaleValue(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const { previousFromDate, previousToDate } = getPreviousPeriodDates(
      fromDate,
      toDate,
    );
    return this.calculateTotalSaleValue(previousFromDate, previousToDate);
  }

  async calculateTotalSaleValueByTimeFrame(
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
        $unwind: '$orderedItems',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orderedItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $project: {
          saleValue: {
            $map: {
              input: '$orderedItems.dimensions',
              as: 'dimension',
              in: {
                $multiply: ['$$dimension.quantity', '$productInfo.salePrice'],
              },
            },
          },
          date: { $dateToString: { format: '%Y-%m-%d', date: dateField } },
        },
      },
      {
        $unwind: '$saleValue',
      },
      {
        $group: {
          _id: '$date',
          totalSaleValue: { $sum: '$saleValue' },
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
      value: item.totalSaleValue,
    }));

    return transformToTimeFrameCoordinates(coordinates, timef);
  }
}
