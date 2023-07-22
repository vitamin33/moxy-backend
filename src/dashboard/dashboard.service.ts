import { Injectable } from '@nestjs/common';
import { DashboardDto } from './dto/dashboard.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from 'src/orders/order.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { Model } from 'mongoose';
import { getISOWeek } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}
  async getOrdersDashboard(request: DashboardDto) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    // Calculate the time frame for aggregation
    const timeFrame = this.calculateTimeFrame(fromDate, toDate);

    // Get the total orders sale value
    const totalSaleValue = await this.calculateTotalSaleValue(fromDate, toDate);

    // Get the total orders cost value
    const totalCostValue = await this.calculateTotalCostValue(fromDate, toDate);

    // Get the total orders count
    const totalOrdersCount = await this.calculateTotalOrdersCount(
      fromDate,
      toDate,
    );

    // Get the orders count by time frame (by day, week, or month) for graph
    const ordersCountByTimeFrame = await this.calculateOrdersCountByTimeFrame(
      fromDate,
      toDate,
    );

    // Get the total orders sale value by time frame for graph
    const totalSaleValueByTimeFrame =
      await this.calculateTotalSaleValueByTimeFrame(fromDate, toDate);

    // Get the total orders cost value by time frame for graph
    const totalCostValueByTimeFrame =
      await this.calculateTotalCostValueByTimeFrame(fromDate, toDate);

    return {
      totalSaleValue,
      totalCostValue,
      totalOrdersCount,
      ordersCountByTimeFrame,
      totalSaleValueByTimeFrame,
      totalCostValueByTimeFrame,
    };
  }

  private calculateTimeFrame(
    fromDate: Date,
    toDate: Date,
  ): 'day' | 'week' | 'month' {
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

  private async calculateTotalSaleValue(
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

  private async calculateTotalCostValue(
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
        $group: {
          _id: null,
          totalCostValue: {
            $sum: {
              $reduce: {
                input: {
                  $map: {
                    input: '$orderedItems.dimensions',
                    as: 'dimension',
                    in: {
                      $multiply: [
                        '$$dimension.quantity',
                        '$productInfo.costPrice',
                      ],
                    },
                  },
                },
                initialValue: 0,
                in: { $add: ['$$value', '$$this'] },
              },
            },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalCostValue: 1,
          totalOrders: 1,
        },
      },
    ]);

    return result.length > 0 ? result[0].totalCostValue : 0;
  }

  private async calculateTotalOrdersCount(
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
  private async calculateOrdersCountByTimeFrame(
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: number }[]> {
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
    // Format the result into an array of { date, value } coordinates
    const coordinates = result.map((item) => ({
      date: new Date(item._id),
      value: item.count,
    }));

    return coordinates;
  }
  private async calculateTotalSaleValueByTimeFrame(
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: number }[]> {
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

    // Format the result into an array of { x, y } coordinates
    const coordinates = result.map((item) => ({
      date: new Date(item._id),
      value: item.totalSaleValue,
    }));

    return coordinates;
  }
  private async calculateTotalCostValueByTimeFrame(
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: any }[]> {
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
          costValue: {
            $map: {
              input: '$orderedItems.dimensions',
              as: 'dimension',
              in: {
                $multiply: ['$$dimension.quantity', '$productInfo.costPrice'],
              },
            },
          },
          date: { $dateToString: { format: '%Y-%m-%d', date: dateField } },
        },
      },
      {
        $unwind: '$costValue',
      },
      {
        $group: {
          _id: '$date',
          totalCostValue: { $sum: '$costValue' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the result into an array of { date, totalCostValue } coordinates
    const coordinates = result.map((item) => ({
      date: new Date(item._id),
      value: item.totalCostValue,
    }));

    return coordinates;
  }
}
