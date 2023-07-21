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
      timeFrame,
      fromDate,
      toDate,
    );

    // Get the total orders sale value by time frame for graph
    const totalSaleValueByTimeFrame =
      await this.calculateTotalSaleValueByTimeFrame(
        timeFrame,
        fromDate,
        toDate,
      );

    // Get the total orders cost value by time frame for graph
    const totalCostValueByTimeFrame =
      await this.calculateTotalCostValueByTimeFrame(
        timeFrame,
        fromDate,
        toDate,
      );

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

    if (dateRangeInDays <= 30) {
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
    timeFrame: 'day' | 'week' | 'month',
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: number }[]> {
    const dateField = '$createdAt';
    const timeFrameGrouping = this.getTimeFrameGrouping(dateField, timeFrame);

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
          timeFrameGroup: timeFrameGrouping[timeFrame],
        },
      },
      {
        $group: {
          _id: '$timeFrameGroup',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the result into an array of { x, y } coordinates
    const coordinates = result.map((item) => ({
      date: new Date(item._id),
      value: item.count,
    }));

    // If the result contains gaps in the time frames (e.g., no orders on certain days), fill in the gaps with zero counts
    const filledCoordinates = this.fillTimeFrameGaps(
      coordinates,
      fromDate,
      toDate,
      timeFrame,
    );

    return filledCoordinates;
  }
  private async calculateTotalSaleValueByTimeFrame(
    timeFrame: 'day' | 'week' | 'month',
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: number }[]> {
    const dateField = '$createdAt';
    const timeFrameGrouping = this.getTimeFrameGrouping(dateField, timeFrame);

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
          timeFrameGroup: timeFrameGrouping[timeFrame],
        },
      },
      {
        $unwind: '$saleValue',
      },
      {
        $group: {
          _id: '$timeFrameGroup',
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

    // Fill in the gaps in the time frames with zero sale value
    const filledCoordinates = this.fillTimeFrameGaps(
      coordinates,
      fromDate,
      toDate,
      timeFrame,
    );

    return filledCoordinates;
  }
  private async calculateTotalCostValueByTimeFrame(
    timeFrame: 'day' | 'week' | 'month',
    fromDate: Date,
    toDate: Date,
  ): Promise<{ date: Date; value: number }[]> {
    const dateField = '$createdAt';
    const timeFrameGrouping = this.getTimeFrameGrouping(dateField, timeFrame);

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
          timeFrameGroup: timeFrameGrouping[timeFrame],
        },
      },
      {
        $unwind: '$costValue',
      },
      {
        $group: {
          _id: '$timeFrameGroup',
          totalCostValue: { $sum: '$costValue' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the result into an array of { x, y } coordinates
    const coordinates = result.map((item) => ({
      date: new Date(item._id),
      value: item.totalCostValue,
    }));

    // Fill in the gaps in the time frames with zero cost value
    const filledCoordinates = this.fillTimeFrameGaps(
      coordinates,
      fromDate,
      toDate,
      timeFrame,
    );

    return filledCoordinates;
  }

  private getTimeFrameGrouping(
    dateField: string,
    timeFrame: 'day' | 'week' | 'month',
  ): any {
    switch (timeFrame) {
      case 'day':
        return { $dateToString: { format: '%Y-%m-%d', date: dateField } };
      case 'week':
        return {
          $concat: [
            { $toString: { $year: dateField } },
            '-',
            {
              $cond: {
                if: { $lte: [{ $week: dateField }, 9] },
                then: { $concat: ['0', { $toString: { $week: dateField } }] },
                else: { $toString: { $week: dateField } },
              },
            },
          ],
        };
      case 'month':
        return { $dateToString: { format: '%Y-%m', date: dateField } };
      default:
        throw new Error(`Invalid time frame: ${timeFrame}`);
    }
  }

  // Helper function to fill gaps in time frames with zero values
  fillTimeFrameGaps(
    coordinates: { date: Date; value: number }[],
    fromDate: Date,
    toDate: Date,
    timeFrame: 'day' | 'week' | 'month',
  ): { date: Date; value: number }[] {
    const filledCoordinates: { date: Date; value: number }[] = [];
    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const matchingCoordinate = coordinates.find((coord) =>
        this.isTimeFrameMatch(currentDate, coord.date, timeFrame),
      );
      if (matchingCoordinate) {
        filledCoordinates.push(matchingCoordinate);
      } else {
        filledCoordinates.push({ date: new Date(currentDate), value: 0 });
      }

      currentDate = this.addTimeFrame(currentDate, 1, timeFrame);
    }

    return filledCoordinates;
  }

  isTimeFrameMatch(
    date1: Date,
    date2: Date,
    timeFrame: 'day' | 'week' | 'month',
  ): boolean {
    if (timeFrame === 'day') {
      return (
        date1.toISOString().slice(0, 10) === date2.toISOString().slice(0, 10)
      );
    } else if (timeFrame === 'week') {
      const week1 = getISOWeek(date1);
      const week2 = getISOWeek(date2);
      return week1 === week2;
    } else if (timeFrame === 'month') {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
      );
    }

    return false;
  }

  addTimeFrame(
    date: Date,
    count: number,
    timeFrame: 'day' | 'week' | 'month',
  ): Date {
    const newDate = new Date(date);

    if (timeFrame === 'day') {
      newDate.setDate(newDate.getDate() + count);
    } else if (timeFrame === 'week') {
      newDate.setDate(newDate.getDate() + count * 7);
    } else if (timeFrame === 'month') {
      newDate.setMonth(newDate.getMonth() + count);
    }

    return newDate;
  }
}
