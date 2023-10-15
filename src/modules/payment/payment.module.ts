import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './invoice.entity';
import { MonopayModule } from '../monopay/monopay.module';
import { BasketModule } from '../basket/basket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    OrdersModule,
    MonopayModule,
    BasketModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
