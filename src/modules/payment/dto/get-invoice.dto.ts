export class UpdateInvoiceDto {
  readonly invoiceId: string;
  readonly status: string;
  readonly amount: number;
  readonly failureReason: string;
  readonly createdDate: Date;
  readonly modifiedDate: Date;
  readonly reference: string;
  readonly ccy: string;
}
