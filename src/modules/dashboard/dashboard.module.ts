import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/user.entity';
import { Order, OrderSchema } from 'src/modules/orders/order.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SaleCalculationService } from './service/sale-calculation.service';
import { CostCalculationService } from './service/cost-calculation.service';
import { OrderCountService } from './service/order-count.service';
import { TimeFrameService } from './service/time-frame.service';
import { ProfitCalculationService } from './service/profit.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    UsersModule,
    ProductsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    SaleCalculationService,
    CostCalculationService,
    OrderCountService,
    TimeFrameService,
    ProfitCalculationService,
  ],
})
export class DashboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
