import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/modules/orders/order.entity';
import {
  formatDate,
  getPreviousPeriodDates,
  transformToTimeFrameCoordinates,
} from '../../../common/utils';
import { ProductsService } from 'src/modules/products/service/products.service';
import { Product } from 'src/modules/products/product.entity';

@Injectable()
export class CostCalculationService {
  private readonly logger = new Logger(CostCalculationService.name);
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
        const product = orderedItem.product as Product;
        if (product) {
          const costPriceInUah =
            this.productsService.calculateCostPrice(product);
          for (const dimen of orderedItem.dimensions) {
            const cost = costPriceInUah * dimen.quantity;
            totalCostValue += cost;
          }
        }
      }
    }
    this.logger.debug(`Total cost: ${totalCostValue}`);

    return Math.floor(totalCostValue);
  }

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
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
      .populate('orderedItems.product'); // Populate the product field in orderedItems

    const dateToTotalCostMap = new Map<string, number>(); // Map to track total cost by date

    let totalCostValue = 0;
    for (const order of orders) {
      for (const orderedItem of order.orderedItems) {
        const product = orderedItem.product as Product;
        if (product) {
          const costPriceInUah =
            this.productsService.calculateCostPrice(product);
          if (!costPriceInUah) {
            continue; // Skip products with no cost price
          }
          for (const dimen of orderedItem.dimensions) {
            const cost = costPriceInUah * dimen.quantity;
            totalCostValue += cost;
          }
        }
      }

      const formattedDate = formatDate(order.createdAt);
      if (dateToTotalCostMap.has(formattedDate)) {
        const existingTotal = dateToTotalCostMap.get(formattedDate) || 0;
        const totalForDate = existingTotal + totalCostValue;
        dateToTotalCostMap.set(formattedDate, totalForDate);
      } else {
        dateToTotalCostMap.set(formattedDate, totalCostValue);
      }
      totalCostValue = 0;
    }

    const result: RangeData[] = Array.from(dateToTotalCostMap.entries()).map(
      ([date, totalCostValue]) => ({
        fromDate: date,
        toDate: date,
        key: date,
        value: Math.floor(totalCostValue),
      }),
    );

    return transformToTimeFrameCoordinates(result, timef);
  }
}
