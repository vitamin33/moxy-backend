import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SubscriberDocument = Subscriber & mongoose.Document;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
