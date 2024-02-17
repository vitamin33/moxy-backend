import { Injectable } from '@nestjs/common';
import { DashboardDto, ProductStatsDto } from './dto/dashboard.dto';
import { SaleCalculationService } from './service/sale-calculation.service';
import { CostCalculationService } from './service/cost-calculation.service';
import { OrderCountService } from './service/order-count.service';
import { TimeFrameService } from './service/time-frame.service';
import { ProfitCalculationService } from './service/profit.service';
import { FacebookService } from '../facebook/facebook.service';
import { ProductStatisticsService } from './service/product-statistics.service';

@Injectable()
export class DashboardService {
  constructor(
    private saleValueService: SaleCalculationService,
    private costValueService: CostCalculationService,
    private ordersCountService: OrderCountService,
    private profitService: ProfitCalculationService,
    private timeFrameService: TimeFrameService,
    private facebookService: FacebookService,
    private productStats: ProductStatisticsService,
  ) {}

  async getOrdersDashboard(request: DashboardDto) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    // Fetch ad spend for current and previous periods
    const [currentAdsReport, previousAdsReport] = await Promise.all([
      this.facebookService.getAdsReport(fromDate, toDate),
      this.facebookService.getPreviousPeriodAdsReport(fromDate, toDate),
    ]);

    // Start all independent async operations concurrently
    const [
      totalSaleValue,
      totalCostValue,
      totalOrdersCount,
      previousTotalSaleValue,
      previousTotalCostValue,
      previousTotalOrdersCount,
      totalProfitValue,
      previousTotalProfitValue,
    ] = await Promise.all([
      this.saleValueService.calculateTotalSaleValue(fromDate, toDate),
      this.costValueService.calculateTotalCostValue(fromDate, toDate),
      this.ordersCountService.calculateTotalOrdersCount(fromDate, toDate),
      this.saleValueService.getPreviousTotalSaleValue(fromDate, toDate),
      this.costValueService.getPreviousTotalCostValue(fromDate, toDate),
      this.ordersCountService.getPreviousTotalOrdersCount(fromDate, toDate),
      this.profitService.calculateTotalProfitValue(
        fromDate,
        toDate,
        currentAdsReport.spendInUah,
      ),
      this.profitService.getPreviousTotalProfitValue(
        fromDate,
        toDate,
        previousAdsReport.spendInUah,
      ),
    ]);

    const timeFrame = this.timeFrameService.calculateTimeFrame(
      fromDate,
      toDate,
    );

    const [
      ordersCountByTimeFrame,
      totalSaleValueByTimeFrame,
      totalCostValueByTimeFrame,
      totalProfitValueByTimeFrame,
    ] = await Promise.all([
      this.ordersCountService.calculateOrdersCountByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      ),
      this.saleValueService.calculateTotalSaleValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      ),
      this.costValueService.calculateTotalCostValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      ),
      this.profitService.calculateTotalProfitValueByTimeFrame(
        fromDate,
        toDate,
        timeFrame,
      ),
    ]);

    // Calculate the percentage changes
    const saleValuePercentageChange =
      previousTotalSaleValue !== 0
        ? ((totalSaleValue - previousTotalSaleValue) / previousTotalSaleValue) *
          100
        : 0;

    const costValuePercentageChange =
      previousTotalCostValue !== 0
        ? ((totalCostValue - previousTotalCostValue) / previousTotalCostValue) *
          100
        : 0;

    const ordersCountPercentageChange =
      previousTotalOrdersCount !== 0
        ? ((totalOrdersCount - previousTotalOrdersCount) /
            previousTotalOrdersCount) *
          100
        : 0;

    const profitValuePercentageChange =
      previousTotalProfitValue !== 0
        ? ((totalProfitValue - previousTotalProfitValue) /
            previousTotalProfitValue) *
          100
        : 0;

    // Return the final dashboard data
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
      currentAdsReport,
      previousAdsReport,
      productStats: { orderStats: [], profitStats: [] },
    };
  }

  async getProductStatistics(request: ProductStatsDto) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);
    this.productStats.generateStatistics(fromDate, toDate);
  }
}
