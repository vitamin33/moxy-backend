import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum MediaType {
  Image = 'Image',
  Video = 'Video',
  ImageSet = 'ImageSet',
}

@Schema()
export class Media extends Document {
  @Prop({ enum: MediaType, default: MediaType.Image })
  type: MediaType;

  @Prop()
  mediaUrls: string[];

  @Prop({ default: false })
  activeHome: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
