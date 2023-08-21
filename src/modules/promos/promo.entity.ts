import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const PromoSchema = SchemaFactory.createForClass(Promo);
