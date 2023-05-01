import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';

interface OrderValue extends Document {
  fullPrice: number;
}
type FullOrderDocument = Order & Document & OrderValue;
export type OrderDocument = HydratedDocument<FullOrderDocument>;

export enum DeliveryType {
  NovaPost,
  NovaPostMachine,
  UkrPost,
}

export enum Status {
  New,
  Accepted,
  Paid,
  Packed,
  Sent,
  Sale,
  Canceled,
  Returned,
}

export enum PaymentType {
  CashAdvance,
  FullPayment,
}

@Schema()
export class Order {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @ApiProperty({ example: 'Lviv', description: 'Delivery city' })
  @Prop()
  deliveryCity: string;

  @ApiProperty({ example: 23, description: 'Nova Post number for delivering' })
  @Prop()
  novaPostNumber: number;

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  client: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }],
  })
  @Type(() => Product)
  products: Product[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
