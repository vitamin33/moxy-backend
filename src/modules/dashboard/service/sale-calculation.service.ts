import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/modules/orders/order.entity';
import {
  formatDate,
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../utils';
import { Product } from 'src/modules/products/product.entity';

@Injectable()
export class SaleCalculationService {
  private readonly logger = new Logger(SaleCalculationService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}
  async calculateTotalSaleValue(fromDate: Date, toDate: Date): Promise<number> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    let totalSaleValue = 0;

    for (const order of orders) {
      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product as Product;

        if (product) {
          const salePriceInUah = product.salePrice;

          for (const dimen of orderedItem.dimensions) {
            const sale = salePriceInUah * dimen.quantity;
            totalSaleValue += sale;
          }
        }
      }
    }

    this.logger.debug(`Total sale: ${totalSaleValue}`);

    return Math.floor(totalSaleValue);
  }

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
    // Modify this method to calculate sale values by time frame
    // Fetch orders within the specified date range
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    // Initialize a map to track total sale by date
    const dateToTotalSaleMap = new Map<string, number>();

    for (const order of orders) {
      let totalSaleValue = 0;

      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product as Product;

        if (product) {
          const salePriceInUah = product.salePrice;

          for (const dimen of orderedItem.dimensions) {
            const sale = salePriceInUah * dimen.quantity;
            totalSaleValue += sale;
          }
        }
      }

      const formattedDate = formatDate(order.createdAt);

      // Update or set the total sale value for this date in the map
      if (dateToTotalSaleMap.has(formattedDate)) {
        const existingTotal = dateToTotalSaleMap.get(formattedDate) || 0;
        dateToTotalSaleMap.set(formattedDate, existingTotal + totalSaleValue);
      } else {
        dateToTotalSaleMap.set(formattedDate, totalSaleValue);
      }
    }

    // Format the result from the map into an array of RangeData coordinates
    const result: RangeData[] = Array.from(dateToTotalSaleMap.entries()).map(
      ([date, totalSaleValue]) => ({
        fromDate: date,
        toDate: date,
        key: date,
        value: Math.floor(totalSaleValue),
      }),
    );

    // Transform the result into time frame coordinates
    return transformToTimeFrameCoordinates(result, timef);
  }
}
