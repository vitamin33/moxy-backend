import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Size {
  @ApiProperty({ description: 'Size name (e.g., S, M, XL)' })
  @Prop({ required: true })
  name: string;
}
export const SizeSchema = SchemaFactory.createForClass(Size);

@Schema()
export class Color {
  @ApiProperty({ description: 'Color name.' })
  @Prop({ required: true })
  name: string;
  @ApiProperty({ description: 'Color hex code.' })
  @Prop({ required: true })
  hexCode: string;
}
export const ColorSchema = SchemaFactory.createForClass(Color);

@Schema()
export class Material {
  @ApiProperty({ description: 'Material name' })
  @Prop({ required: true })
  name: string;
}
export const MaterialSchema = SchemaFactory.createForClass(Material);

export type AttributesWithCategories = Attributes & {
  _id: mongoose.Types.ObjectId;
  productCategories: string[];
};

@Schema()
export class Attributes {
  colors: Color[];

  sizes: Size[];

  materials: Material[];
}

export const AttributesSchema = SchemaFactory.createForClass(Attributes);
