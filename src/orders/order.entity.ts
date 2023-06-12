import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Color } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';

export type OrderDocument = Order & Document;

export enum DeliveryType {
  NovaPost = 'NovaPost',
  NovaPostMachine = 'NovaPostMachine',
  UkrPost = 'UkrPost',
}

export enum Status {
  New = 'New',
  Paid = 'Paid',
  Packed = 'Packed',
  Sent = 'Sent',
  Sale = 'Sale',
  Canceled = 'Canceled',
  Returned = 'Returned',
}

export enum PaymentType {
  CashAdvance = 'CashAdvance',
  FullPayment = 'FullPayment',
}

@Schema()
export class OrderedItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: Color })
  color: Color;

  @Prop({ type: Number, required: true, default: 0 })
  quantity: number;
}

@Schema({
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  timestamps: true,
})
export class Order {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @ApiProperty({ example: 'Lviv', description: 'Delivery city' })
  @Prop()
  deliveryCity: string;

  @ApiProperty({ example: 23, description: 'Nova Post number for delivering' })
  @Prop()
  novaPostNumber: number;

  @ApiProperty({ example: 12, description: 'Ukr Post number for delivering' })
  @Prop()
  ukrPostNumber: number;

  @ApiProperty({ example: 150, description: 'Cash advance payment value' })
  @Prop()
  cashAdvanceValue: number;

  @ApiProperty({ example: 233, description: 'Nova Post number for delivering' })
  @Prop()
  novaPostMachineNumber: number;

  @ApiProperty({
    example: 'NovaPost',
    description: 'Delivery type. Only values from DeliveryType enum',
  })
  @Prop({ type: String, enum: DeliveryType, default: DeliveryType.NovaPost })
  deliveryType: DeliveryType;

  @ApiProperty({
    example: 'New',
    description: 'Order status. Only values from Status enum',
  })
  @Prop({ type: String, enum: Status, default: Status.New })
  status: Status;

  @ApiProperty({
    example: 'FullPayment',
    description: 'Payment type. Only values from PaymentType enum',
  })
  @Prop({ type: String, enum: PaymentType, default: PaymentType.FullPayment })
  paymentType: PaymentType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  client: User;

  @Prop({
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        color: { type: String, enum: Color },
        quantity: { type: Number, required: true, default: 0 },
      },
    ],
    required: true,
    default: [],
  })
  orderedItems: {
    product: mongoose.Schema.Types.ObjectId;
    color: Color;
    quantity: number;
  }[];

  id: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('id').get(function (this: Order) {
  return this._id;
});
