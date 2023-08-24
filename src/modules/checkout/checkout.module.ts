import { Module, forwardRef } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
import { MonobankModule } from '../monobank/monobank.module';

@Module({
  imports: [OrdersModule, AuthModule, MonobankModule],
  controllers: [CheckoutController, InvoicesController],
  providers: [CheckoutService, InvoicesService],
})
export class CheckoutModule {}
