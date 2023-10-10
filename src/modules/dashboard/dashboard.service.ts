import { Injectable } from '@nestjs/common';
import { DashboardDto } from './dto/dashboard.dto';
import { SaleCalculationService } from './service/sale-calculation.service';
import { CostCalculationService } from './service/cost-calculation.service';
import { OrderCountService } from './service/order-count.service';
import { TimeFrameService } from './service/time-frame.service';
import { ProfitCalculationService } from './service/profit.service';

@Injectable()
export class DashboardService {
  constructor(
    private saleValueService: SaleCalculationService,
    private costValueService: CostCalculationService,
    private ordersCountService: OrderCountService,
    private profitService: ProfitCalculationService,
    private timeFrameService: TimeFrameService,
  ) {}
  async getOrdersDashboard(request: DashboardDto) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    const timeFrame = this.timeFrameService.calculateTimeFrame(
      fromDate,
      toDate,
    );

    const totalSaleValue = await this.saleValueService.calculateTotalSaleValue(
      fromDate,
      toDate,
    );

    const totalCostValue = await this.costValueService.calculateTotalCostValue(
      fromDate,
      toDate,
    );

    const totalOrdersCount =
      await this.ordersCountService.calculateTotalOrdersCount(fromDate, toDate);

    const previousTotalSaleValue =
      await this.saleValueService.getPreviousTotalSaleValue(fromDate, toDate);

    const previousTotalCostValue =
      await this.costValueService.getPreviousTotalCostValue(fromDate, toDate);

    const previousTotalOrdersCount =
      await this.ordersCountService.getPreviousTotalOrdersCount(
        fromDate,
        toDate,
      );

    // Calculate the percentage change for totalSaleValue
    const saleValuePercentageChange =
      previousTotalSaleValue !== 0
        ? ((totalSaleValue - previousTotalSaleValue) / previousTotalSaleValue) *
          100
        : 0;

    // Calculate the percentage change for totalCostValue
    const costValuePercentageChange =
      previousTotalCostValue !== 0
        ? ((totalCostValue - previousTotalCostValue) / previousTotalCostValue) *
          100
        : 0;

    // Calculate the percentage change for totalOrdersCount
    const ordersCountPercentageChange =
      previousTotalOrdersCount !== 0
        ? ((totalOrdersCount - previousTotalOrdersCount) /
            previousTotalOrdersCount) *
          100
        : 0;

    // Get the orders count by time frame (by day, week, or month) for graph
    const ordersCountByTimeFrame =
      await this.ordersCountService.calculateOrdersCountByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      );

    // Get the total orders sale value by time frame for graph
    const totalSaleValueByTimeFrame =
      await this.saleValueService.calculateTotalSaleValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      );

    // Get the total orders cost value by time frame for graph
    const totalCostValueByTimeFrame =
      await this.costValueService.calculateTotalCostValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      );

    const totalProfitValue = await this.profitService.calculateTotalProfitValue(
      fromDate,
      toDate,
    );

    const previousTotalProfitValue =
      await this.profitService.getPreviousTotalProfitValue(fromDate, toDate);

    // Calculate the percentage change for totalProfitValue
    const profitValuePercentageChange =
      previousTotalProfitValue !== 0
        ? ((totalProfitValue - previousTotalProfitValue) /
            previousTotalProfitValue) *
          100
        : 0;

    // Get the total profit value by time frame for graph
    const totalProfitValueByTimeFrame =
      await this.profitService.calculateTotalProfitValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      );

    return {
      totalSaleValue,
      totalCostValue,
      totalOrdersCount,
      previousTotalSaleValue,
      previousTotalCostValue,
      previousTotalOrdersCount,
      saleValuePercentageChange,
      costValuePercentageChange,
      ordersCountPercentageChange,
      ordersCountByTimeFrame,
      totalSaleValueByTimeFrame,
      totalCostValueByTimeFrame,
      totalProfitValue,
      previousTotalProfitValue,
      profitValuePercentageChange,
      totalProfitValueByTimeFrame,
    };
  }
}
