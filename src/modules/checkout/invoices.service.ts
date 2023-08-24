import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { MonobankService } from '../monobank/monobank.service';

@Injectable()
export class InvoicesService {
  constructor(
    private ordersService: OrdersService,
    private monobankService: MonobankService,
  ) {}
  async processInvoiceStatus(userId: string, statusData: any) {
    // Here you can implement the logic to process the invoice status
    // This could involve updating order status, sending notifications, etc.
    console.log('Received invoice status:', statusData);
    const invoiceId = statusData.invoiceId;
    const result = await this.monobankService.getInvoiceStatus(invoiceId);

    return { message: 'Invoce status: $result' };
  }
}
