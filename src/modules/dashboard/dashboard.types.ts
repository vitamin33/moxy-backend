import { Product } from 'src/modules/products/product.entity'; // Adjust the import path as necessary

export class ProductOrderCountStat {
  product: Product;
  orderCount: number;
  percentageFromAllOrdersCount: number;

  constructor(
    product: Product,
    orderCount: number,
    percentageFromAllOrdersCount: number,
  ) {
    this.product = product;
    this.orderCount = orderCount;
    this.percentageFromAllOrdersCount = percentageFromAllOrdersCount;
  }
}

export class ProductProfitStat {
  product: Product;
  profit: number;
  percentageFromAllProfit: number;

  constructor(
    product: Product,
    profit: number,
    percentageFromAllProfit: number,
  ) {
    this.product = product;
    this.profit = profit;
    this.percentageFromAllProfit = percentageFromAllProfit;
  }
}
