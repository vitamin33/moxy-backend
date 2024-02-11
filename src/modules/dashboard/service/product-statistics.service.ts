import { Injectable } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { ProductOrderCountStat, ProductProfitStat } from '../dashboard.types';
import { Order } from 'src/modules/orders/order.entity';
import { Product, extractProductId } from 'src/modules/products/product.entity';

@Injectable()
export class ProductStatisticsService {
  constructor(
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  async generateStatistics(fromDate: Date, toDate: Date) {
    const allOrders = await this.ordersService.getOrdersWithinPeriod(
      fromDate,
      toDate,
    );

    let totalOrderCount = 0;
    let totalProfit = 0;
    const productCounts = new Map<string, number>();
    const productProfits = new Map<string, number>();

    for (const order of allOrders) {
      for (const item of order.orderedItems) {
        const productId = extractProductId(item.product);
        const count = productCounts.get(productId) || 0;
        productCounts.set(productId, count + 1);
        totalOrderCount += 1;

        const profit = await this.calculateProfitForOrderItem(item);
        const currentProfit = productProfits.get(productId) || 0;
        productProfits.set(productId, currentProfit + profit);
        totalProfit += profit;
      }
    }

    const orderStats = [];
    const profitStats = [];

    for (const [productId, count] of productCounts) {
      const product = await this.productsService.getProductById(productId); // Adjust based on actual method signature
      const percentageOfOrders = count / totalOrderCount;
      orderStats.push(
        new ProductOrderCountStat(product, count, percentageOfOrders),
      );
    }

    for (const [productId, profit] of productProfits) {
      const product = await this.productsService.getProductById(productId); // Adjust based on actual method signature
      const percentageOfProfit = profit / totalProfit;
      profitStats.push(
        new ProductProfitStat(product, profit, percentageOfProfit),
      );
    }

    orderStats.sort((a, b) => b.orderCount - a.orderCount);
    profitStats.sort((a, b) => b.profit - a.profit);

    return { orderStats, profitStats };
  }

  async calculateProfitForOrderItem(orderedItem: any): Promise<number> {
    const product = orderedItem.product as Product;
    if (!product) {
      return 0;
    }

    const salePriceInUah = product.salePrice;
    const costPriceInUah =
      await this.productsService.calculateCostPrice(product);

    let totalProfit = 0;
    for (const dimension of orderedItem.dimensions) {
      const profitPerDimension =
        (salePriceInUah - costPriceInUah) * dimension.quantity;
      totalProfit += profitPerDimension;
    }

    return totalProfit;
  }
}
