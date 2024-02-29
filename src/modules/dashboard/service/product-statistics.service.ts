import { Injectable } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { ProductOrderCountStat, ProductProfitStat } from '../dashboard.types';
import { Order, OrderedItem } from 'src/modules/orders/order.entity';
import { Product, extractProductId } from 'src/modules/products/product.entity';

@Injectable()
export class ProductStatisticsService {
  constructor(
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  async generateStatistics(fromDate: Date, toDate: Date) {
    console.time('generateStatistics');

    const allOrders = await this.ordersService.getOrdersWithinPeriod(
      fromDate,
      toDate,
    );

    let totalOrderCount = 0;
    let totalProfit = 0;
    const productCounts = new Map<string, number>();
    const productIds = new Set<string>();

    // Collect productIds and initial processing
    for (const order of allOrders) {
      for (const item of order.orderedItems) {
        const productId = extractProductId(item.product);
        productIds.add(productId);

        const count = productCounts.get(productId) || 0;
        productCounts.set(productId, count + 1);
        totalOrderCount += 1;
      }
    }

    const products = await this.productsService.getProductsByIds([
      ...productIds,
    ]);
    const productsMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    const profitStats = [];
    const profitCalculations = allOrders.flatMap((order) =>
      order.orderedItems.map((item) =>
        this.calculateProfitForOrderItem(item, productsMap),
      ),
    );

    const productProfits = new Map<string, number>();
    const profits = await Promise.all(profitCalculations);
    profits.forEach(({ productId, orderProfit }) => {
      const currentProfit = productProfits.get(productId) || 0;
      productProfits.set(productId, currentProfit + orderProfit);
      totalProfit += orderProfit;
    });
    for (const [productId, profit] of productProfits) {
      const product = productsMap.get(productId);
      const percentageOfProfit = Number(
        ((profit / totalProfit) * 100).toFixed(1),
      );
      profitStats.push(
        new ProductProfitStat(product, profit, percentageOfProfit),
      );
    }
    profitStats.sort((a, b) => b.profit - a.profit);

    const orderStats = [];
    for (const [productId, count] of productCounts) {
      const product = productsMap.get(productId);
      const percentageOfOrders = Number(
        ((count / totalOrderCount) * 100).toFixed(1),
      );
      orderStats.push(
        new ProductOrderCountStat(product, count, percentageOfOrders),
      );
    }
    orderStats.sort((a, b) => b.orderCount - a.orderCount);

    console.timeEnd('generateStatistics');

    return { orderStats, profitStats };
  }

  async calculateProfitForOrderItem(
    orderedItem: OrderedItem,
    productsMap: Map<string, Product>,
  ): Promise<any> {
    const productId = extractProductId(orderedItem.product);
    const product = productsMap.get(productId);
    if (!product) {
      return { productId, profit: 0 };
    }

    const salePriceInUah = product.salePrice;
    const costPriceInUah = this.productsService.calculateCostPrice(product);

    let orderProfit = 0;
    for (const dimension of orderedItem.dimensions) {
      const profitPerDimension =
        (salePriceInUah - costPriceInUah) * dimension.quantity;
      orderProfit += profitPerDimension;
    }

    return { productId, orderProfit };
  }
}
