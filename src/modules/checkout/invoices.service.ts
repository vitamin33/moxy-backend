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
    const status = statusData.status;
    const result = await this.monobankService.getInvoiceStatus(
      invoiceId,
      status,
    );
    const finalStatus = result.status;
    const success = successPayment(finalStatus);

    return { message: `Invoice status: ${finalStatus}` };
  }
}

function successPayment(status: string): boolean {
  const normalizedInput = status.toLowerCase();

  switch (normalizedInput) {
    case 'success':
      return true;
    default:
      return false;
  }
}
