import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Promo extends Document {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true })
  productId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Date })
  finalDate: Date;
}

export const PromoSchema = SchemaFactory.createForClass(Promo);
