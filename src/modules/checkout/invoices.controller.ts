import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoicesService) {}

  @UseInterceptors(CacheInterceptor)
  @Post('receive')
  async receiveInvoiceStatus(
    @Param('userId') userId: string,
    @Body() statusData: any,
  ) {
    return this.invoiceService.processInvoiceStatus(userId, statusData);
  }
}
