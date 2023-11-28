import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ProductAdvatages extends Document {
  @Prop({ required: true })
  header: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  productId: string;
}

export const ProductAdvatagesSchema =
  SchemaFactory.createForClass(ProductAdvatages);
