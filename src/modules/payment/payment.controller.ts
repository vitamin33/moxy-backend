import { Body, Controller, Post } from '@nestjs/common';
import { UpdateInvoiceDto } from './dto/get-invoice.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('invoices')
  async getInvoiceStatus(@Body() invoiceDto: UpdateInvoiceDto) {
    return this.paymentService.getInvoiceStatus(invoiceDto);
  }
}
