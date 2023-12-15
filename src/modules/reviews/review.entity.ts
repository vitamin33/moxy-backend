import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Review extends Document {
  @Prop()
  avatarImageUrl: string;

  @Prop({ required: true })
  clientName: string;

  @Prop()
  reviewText: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: mongoose.Schema.Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
