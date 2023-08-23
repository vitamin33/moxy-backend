import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InvoicesService {
  constructor(private ordersService: OrdersService) {}
  async processInvoiceStatus(userId: string, statusData: any) {
    // Here you can implement the logic to process the invoice status
    // This could involve updating order status, sending notifications, etc.
    console.log('Received invoice status:', statusData);
    // Implement your business logic here
    return { message: 'Invoce status update.' };
  }
}
