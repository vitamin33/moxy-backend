import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/modules/orders/order.entity';
import {
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../utils';
import { ProductsService } from 'src/modules/products/service/products.service';

@Injectable()
export class CostCalculationService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async calculateTotalCostValue(fromDate: Date, toDate: Date): Promise<number> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    let totalCostValue = 0;

    for (const order of orders) {
      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product;
        if (product) {
          //totalCostValue += this.productsService.calculateCostPrice(product);
        }
      }
    }

    return totalCostValue;
  }

  // Function to get the previous total cost value for the same time frame as the current period
  async getPreviousTotalCostValue(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const { previousFromDate, previousToDate } = getPreviousPeriodDates(
      fromDate,
      toDate,
    );
    return this.calculateTotalCostValue(previousFromDate, previousToDate);
  }

  async calculateTotalCostValueByTimeFrame(
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
