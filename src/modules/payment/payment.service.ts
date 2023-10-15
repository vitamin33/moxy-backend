import { Injectable, Logger } from '@nestjs/common';
import { UpdateInvoiceDto } from './dto/get-invoice.dto';
import { OrdersService } from '../orders/orders.service';
import { Invoice, InvoiceDocument } from './invoice.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from '../orders/order.entity';
import { MonopayService } from '../monopay/monopay.service';
import { BasketService } from '../basket/basket.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private ordersService: OrdersService,
    private monopayService: MonopayService,
    private basketService: BasketService,
  ) {}
  async getInvoiceStatus(invoiceDto: UpdateInvoiceDto) {
    const referencesArr = invoiceDto.reference.split(' ');
    const orderId = referencesArr[0];
    const userId = referencesArr[1];
    const existingInvoice = await this.invoiceModel
      .findOne({ invoiceId: invoiceDto.invoiceId })
      .exec();

    if (invoiceDto.status === 'success') {
      this.ordersService.changeOrderStatus(orderId, Status.Paid);
      this.basketService.clearBasket(userId);
      this.logger.debug(
        `Invoice update: ${invoiceDto.invoiceId} ${invoiceDto.status}, order status changed to - Paid`,
      );
    } else if (
      invoiceDto.status === 'failure' ||
      invoiceDto.status === 'expired' ||
      invoiceDto.status === 'reversed'
    ) {
      this.logger.debug(
        `Invoice failed to pay: ${invoiceDto.invoiceId} ${invoiceDto.status}, order status changed to - PaymentFailed`,
      );
      this.ordersService.changeOrderStatus(orderId, Status.PaymentFailed);
      this.removeMonopayInvoice(invoiceDto.invoiceId);
      this.removeInvoiceEntity(invoiceDto.invoiceId);
    } else {
      this.logger.debug(
        `Invoice updated with status: ${invoiceDto.invoiceId} ${invoiceDto.status}`,
      );
    }

    let invoice;
    if (existingInvoice) {
      // Update existing invoice properties
      existingInvoice.updatedAt = invoiceDto.modifiedDate;
      existingInvoice.createdAt = invoiceDto.createdDate;
      invoice = await existingInvoice.save();
    } else {
      // Create a new invoice
      invoice = new this.invoiceModel({
        ...invoiceDto,
      });
      await invoice.save();
    }
  }
  async removeInvoiceEntity(invoiceId: string) {
    const invoiceRemoved = await this.removeInvoice(invoiceId);
    if (invoiceRemoved) {
      this.logger.debug(`Invoice removed from InvoiceModel: ${invoiceId}`);
    }
  }
  async removeMonopayInvoice(invoiceId: string) {
    const invoiceRemoved = await this.monopayService.removeInvoice(invoiceId);
    if (invoiceRemoved) {
      this.logger.debug(`Invoice removed from monopay: ${invoiceId}`);
    }
  }

  private async removeInvoice(invoiceId: string): Promise<boolean> {
    try {
      const result = await this.invoiceModel.deleteOne({ invoiceId }).exec();
      return result.deletedCount > 0; // Check if at least one document was deleted
    } catch (error) {
      this.logger.error(`Error removing invoice: ${error.message}`);
      return false;
    }
  }
}
