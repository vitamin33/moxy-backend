// profit-calculation.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/modules/orders/order.entity';
import {
  formatDate,
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../utils';
import { ProductsService } from 'src/modules/products/service/products.service';
import { Product } from 'src/modules/products/product.entity';

@Injectable()
export class ProfitCalculationService {
  private readonly logger = new Logger(ProfitCalculationService.name);
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async calculateTotalProfitValue(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    let totalProfitValue = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;

    for (const order of orders) {
      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product as Product;
        if (product) {
          const salePriceInUah = product.salePrice;
          const costPriceInUah =
            this.productsService.calculateCostPrice(product);

          if (!costPriceInUah) {
            continue; // Skip products with no cost price
          }

          for (const dimen of orderedItem.dimensions) {
            const profit = (salePriceInUah - costPriceInUah) * dimen.quantity;
            const sale = salePriceInUah * dimen.quantity;
            const cost = costPriceInUah * dimen.quantity;
            totalCostValue += cost;
            totalProfitValue += profit;
            totalSaleValue += sale;
          }
        }
      }
    }
    this.logger.debug(
      `Total sale: ${totalSaleValue}, total cost: ${totalCostValue}, total profit: ${totalProfitValue}`,
    );

    return Math.floor(totalProfitValue);
  }

  async getPreviousTotalProfitValue(
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const { previousFromDate, previousToDate } = getPreviousPeriodDates(
      fromDate,
      toDate,
    );
    return this.calculateTotalProfitValue(previousFromDate, previousToDate);
  }

  async calculateTotalProfitValueByTimeFrame(
    fromDate: Date,
    toDate: Date,
    timef: 'day' | 'week' | 'month',
  ): Promise<RangeData[]> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    const dateToTotalProfitMap = new Map<string, number>(); // Map to track total profit by date

    for (const order of orders) {
      let totalProfitValue = 0;

      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product as Product;
        if (product) {
          const salePriceInUah = product.salePrice;
          const costPriceInUah =
            this.productsService.calculateCostPrice(product);

          if (!costPriceInUah) {
            continue; // Skip products with no cost price
          }

          for (const dimen of orderedItem.dimensions) {
            const profit = (salePriceInUah - costPriceInUah) * dimen.quantity;
            totalProfitValue += profit;
          }
        }
      }

      const formattedDate = formatDate(order.createdAt);

      // Update or set the total profit value for this date in the map
      if (dateToTotalProfitMap.has(formattedDate)) {
        const existingTotal = dateToTotalProfitMap.get(formattedDate) || 0;
        dateToTotalProfitMap.set(
          formattedDate,
          existingTotal + totalProfitValue,
        );
      } else {
        dateToTotalProfitMap.set(formattedDate, totalProfitValue);
      }
    }

    // Format the result from the map into an array of RangeData coordinates
    const result: RangeData[] = Array.from(dateToTotalProfitMap.entries()).map(
      ([date, totalProfitValue]) => ({
        fromDate: date,
        toDate: date,
        key: date,
        value: Math.floor(totalProfitValue),
      }),
    );

    return transformToTimeFrameCoordinates(result, timef);
  }
}
