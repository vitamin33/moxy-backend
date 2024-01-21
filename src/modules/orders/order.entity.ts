import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';
import { User } from 'src/modules/users/user.entity';
import { Product } from '../products/product.entity';

export type OrderDocument = Order & Document;
export type OrderedItemDocument = OrderedItem & Document;

export enum DeliveryType {
  NovaPost = 'NovaPost',
  UkrPost = 'UkrPost',
}

export enum Status {
  Reserved = 'Reserved',
  Paid = 'Paid',
  Packed = 'Packed',
  Sent = 'Sent',
  Sale = 'Sale',
  Canceled = 'Canceled',
  PaymentFailed = 'PaymentFailed',
  Returned = 'Returned',
}

export enum PaymentType {
  CashAdvance = 'CashAdvance',
  FullPayment = 'FullPayment',
}

@Schema({ _id: false })
export class NovaPost {
  @Prop({ required: true })
  ref: string;
  @Prop()
  presentName: string;
  @Prop()
  postMachineType: string;
  @Prop({ required: true })
  number: number;
}

export const NovaPostSchema = SchemaFactory.createForClass(NovaPost);

@Schema({ _id: false })
export class City {
  @Prop({ required: true })
  ref: string;
  @Prop()
  mainDescription: string;
  @Prop()
  presentName: string;
  @Prop()
  deliveryCityRef: string;
}

export const CitySchema = SchemaFactory.createForClass(City);

@Schema({ _id: false })
export class OrderedItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: mongoose.Schema.Types.ObjectId | Product;

  @Prop({ type: [DimensionSchema] })
  dimensions: Dimension[];
}

export const OrderedItemSchema = SchemaFactory.createForClass(OrderedItem);

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

  @ApiProperty({
    example: 'Lviv, post number 12',
    description: 'Ukr Post Info for delivering',
  })
  @Prop()
  ukrPostInfo: string;

  @ApiProperty({
    description: 'Nova Post ref to EN number',
  })
  @Prop({ required: false })
  novaEN: string;

  @ApiProperty({ example: 150, description: 'Cash advance payment value' })
  @Prop()
  cashAdvanceValue: number;

  @ApiProperty({
    description: 'Nova Post object data for delivering with Nova Poshta.',
  })
  @Prop({ type: NovaPostSchema, required: false })
  novaPost: NovaPost;

  @ApiProperty({
    description: 'City object data for delivering with Nova Poshta.',
  })
  @Prop({ type: CitySchema, required: false })
  city: City;

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
  @Prop({ type: String, enum: Status, default: Status.Reserved })
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

  @Prop({ type: [OrderedItemSchema], required: true, default: [] })
  orderedItems: OrderedItem[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  id: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Set the 'toObject' transformation to exclude '__v' and keep '_id'
OrderSchema.set('toObject', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    delete ret.__v;
    return ret;
  },
});

OrderSchema.virtual('id').get(function (this: Order) {
  return this._id;
});

export interface OrderedProduct {
  product: string;
  productName: string;
  productPrice: number;
  dimensions: Dimension[];
}
