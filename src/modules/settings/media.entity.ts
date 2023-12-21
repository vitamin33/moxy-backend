import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum MediaType {
  Image = 'Image',
  Video = 'Video',
  ImageSet = 'ImageSet',
}
export function parseMediaType(value: string): MediaType | undefined {
  const enumKeys = Object.keys(MediaType).filter(
    (k) => typeof MediaType[k as any] === 'string',
  );

  for (const key of enumKeys) {
    if (MediaType[key as keyof typeof MediaType] === value) {
      return MediaType[key as keyof typeof MediaType];
    }
  }

  return undefined;
}

@Schema()
export class Media extends Document {
  @Prop({ enum: MediaType, default: MediaType.Image })
  type: MediaType;

  @Prop()
  mediaUrls: string[];

  @Prop({ default: false })
  activeHome: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  productId: mongoose.Schema.Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
