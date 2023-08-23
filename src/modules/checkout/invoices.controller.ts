import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoicesService) {}

  @Post('receive')
  async receiveInvoiceStatus(
    @Param('userId') userId: string,
    @Body() statusData: any,
  ) {
    return this.invoiceService.processInvoiceStatus(userId, statusData);
  }
}
