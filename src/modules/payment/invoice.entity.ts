import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({
  timestamps: true,
})
export class Invoice {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  invoiceId: string;

  @Prop()
  status: string;

  @Prop()
  failureReason: string;

  @Prop()
  amount: number;

  @Prop()
  ccy: string;

  @Prop()
  reference: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  id: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.virtual('id').get(function (this: Invoice) {
  return this._id;
});
