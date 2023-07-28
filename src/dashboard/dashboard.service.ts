import { Injectable } from '@nestjs/common';
import { DashboardDto } from './dto/dashboard.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from 'src/orders/order.entity';
import { Model } from 'mongoose';

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
      timeFrame,
    );

    // Get the total orders sale value by time frame for graph
    const totalSaleValueByTimeFrame =
      await this.calculateTotalSaleValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      );

    // Get the total orders cost value by time frame for graph
    const totalCostValueByTimeFrame =
      await this.calculateTotalCostValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
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
  private async calculateTotalSaleValueByTimeFrame(
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
  private async calculateTotalCostValueByTimeFrame(
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

    // Format the result into an array of RangeData coordinates
    const coordinates = result.map((item) => ({
      fromDate: item._id,
      toDate: item._id,
      key: item._id,
      value: item.totalCostValue,
    }));

    return transformToTimeFrameCoordinates(coordinates, timef);
  }
}
function transformToTimeFrameCoordinates(
  coordinates: RangeData[],
  timef: string,
) {
  switch (timef) {
    case 'week':
      return compressToWeeks(coordinates);
    case 'month':
      return compressToMonths(coordinates);
    default:
      return coordinates;
  }
}

function compressToWeeks(coordinates: RangeData[]): RangeData[] {
  const compressedCoordinates: RangeData[] = [];
  let currentWeekNumber: number | null = null;
  let currentWeekOrders: number = 0;

  for (const coordinate of coordinates) {
    const weekRange = getWeekNumberWithRange(coordinate.fromDate);

    if (currentWeekNumber === null) {
      currentWeekNumber = weekRange.unitNumber;
      currentWeekOrders = coordinate.value;
    } else if (currentWeekNumber === weekRange.unitNumber) {
      currentWeekOrders += coordinate.value;
    } else {
      compressedCoordinates.push({
        fromDate: weekRange.fromDate,
        toDate: weekRange.toDate,
        key: `${currentWeekNumber}`,
        value: currentWeekOrders,
      });

      currentWeekNumber = weekRange.unitNumber;
      currentWeekOrders = coordinate.value;
    }
  }
  // Add the last week's data
  if (currentWeekNumber !== null) {
    const weekRange = getWeekNumberWithRange(
      coordinates[coordinates.length - 1].fromDate,
    );
    compressedCoordinates.push({
      fromDate: weekRange.fromDate,
      toDate: weekRange.toDate,
      key: `${currentWeekNumber}`,
      value: currentWeekOrders,
    });
  }
  return compressedCoordinates;
}

function compressToMonths(coordinates: RangeData[]): RangeData[] {
  const compressedCoordinates: RangeData[] = [];
  let currentMonth: string | null = null;
  let currentMonthOrders: number = 0;

  for (const coordinate of coordinates) {
    const month = getMonthWithRange(coordinate.fromDate);

    if (currentMonth === null) {
      currentMonth = month.unitNumber.toString();
      currentMonthOrders = coordinate.value;
    } else if (currentMonth === month.unitNumber.toString()) {
      currentMonthOrders += coordinate.value;
    } else {
      compressedCoordinates.push({
        fromDate: coordinate.fromDate,
        toDate: coordinate.toDate,
        key: currentMonth,
        value: currentMonthOrders,
      });

      currentMonth = month.unitNumber.toString();
      currentMonthOrders = coordinate.value;
    }
  }
  // Add the last month's data
  if (currentMonth !== null) {
    const month = getMonthWithRange(
      coordinates[coordinates.length - 1].fromDate,
    );
    compressedCoordinates.push({
      fromDate: month.fromDate,
      toDate: month.toDate,
      key: currentMonth,
      value: currentMonthOrders,
    });
  }
  return compressedCoordinates;
}

// Function to convert the date in format 'Y-m-d' to week number
function getWeekNumberWithRange(date: string): DateRange {
  const targetDate = new Date(date);
  const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const dayOfWeek = firstDayOfYear.getDay();
  const weekNumber =
    Math.floor(
      (targetDate.getTime() - firstDayOfYear.getTime() - dayOfWeek * 86400000) /
        604800000,
    ) + 1;

  // Calculate the start date (fromDate) of the week
  const fromDate = new Date(
    targetDate.getFullYear(),
    0,
    (weekNumber - 1) * 7 + 1,
  )
    .toISOString()
    .split('T')[0];

  // Calculate the end date (toDate) of the week
  const toDate = new Date(targetDate.getFullYear(), 0, (weekNumber - 1) * 7 + 7)
    .toISOString()
    .split('T')[0];

  return {
    unitNumber: weekNumber,
    fromDate,
    toDate,
  };
}

function getMonthWithRange(date: string): DateRange {
  const [year, month, _] = date.split('-');
  const monthNumber = parseInt(month);

  // Calculate the start date (fromDate) of the month
  const fromDate = new Date(`${year}-${month}-01`).toISOString().split('T')[0];

  // Calculate the end date (toDate) of the month
  const lastDay = new Date(parseInt(year), monthNumber, 0).getDate();
  const toDate = new Date(`${year}-${month}-${lastDay}`)
    .toISOString()
    .split('T')[0];

  return {
    unitNumber: monthNumber,
    fromDate,
    toDate,
  };
}
