import { Injectable, Logger } from '@nestjs/common';
import { UpdateInvoiceDto } from './dto/get-invoice.dto';
import { OrdersService } from '../orders/orders.service';
import { Invoice, InvoiceDocument } from './invoice.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from '../orders/order.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private ordersService: OrdersService,
  ) {}
  async getInvoiceStatus(invoiceDto: UpdateInvoiceDto) {
    this.logger.debug(
      `Invoice update: ${invoiceDto.invoiceId} ${invoiceDto.status}`,
    );

    const orderId = invoiceDto.reference;

    // Find the corresponding order
    const order = await this.ordersService.getOrderDocumentById(orderId);

    // Check if the invoice's modifiedDate is newer than the updatedAt field in the stored invoice
    const existingInvoice = await this.invoiceModel
      .findOne({ invoiceId: invoiceDto.invoiceId })
      .exec();

    if (
      !existingInvoice ||
      invoiceDto.modifiedDate > existingInvoice.updatedAt
    ) {
      // Update the order status to 'Paid' when the invoice status is 'success'
      if (invoiceDto.status === 'success') {
        order.status = Status.Paid;
        await order.save();
      }

      // Store the invoice data
      const invoice = new this.invoiceModel({
        ...invoiceDto,
        updatedAt: invoiceDto.modifiedDate, // Set updatedAt to modifiedDate
      });

      await invoice.save();
    } else {
      // The data is outdated, do nothing
      this.logger.debug('Invoice data is outdated, no updates were made.');
    }
  }
}
