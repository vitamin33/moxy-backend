import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HydratedDocument, ObjectId } from 'mongoose';

export enum Color {
  Black = 'Black',
  White = 'White',
  Grey = 'Grey',
  Pink = 'Pink',
  PinkLeo = 'PinkLeo',
  Leo = 'Leo',
  Brown = 'Brown',
  Beige = 'Beige',
  Purple = 'Purple',
  Zebra = 'Zebra',
  Jeans = 'Jeans',
  Green = 'Green',
  Bars = 'Bars',
  Snake = 'Snake',
  Unified = 'Unified',
}

type FullProductDocument = Product & Document;
export type ProductDocument = HydratedDocument<FullProductDocument>;

@Schema({
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Dimension {
  @ApiProperty({ example: 'Black', description: 'Product color' })
  @Prop({ type: String, enum: Color, default: Color.Black })
  color: string;

  @Prop()
  size: string;

  @Prop()
  material: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}
@Schema()
export class Product {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @ApiProperty({ example: 'Bag', description: 'Product name' })
  @Prop()
  name: string;

  @ApiProperty({
    example: 'style_bag',
    description: 'Human readable ID name with snake case',
  })
  @Prop()
  idName: string;

  marginValue: number;

  @ApiProperty({
    example: 'This product is awesome',
    description: 'Product description',
  })
  @Prop()
  description: string;

  @ApiProperty({
    example: 'Array of image URLs',
    description: 'Array of image urls',
  })
  @Prop()
  images: [string];

  @ApiProperty({ example: 1.2, description: 'Cost price' })
  @Prop()
  costPrice: number;

  @ApiProperty({ example: 2.3, description: 'Sale price' })
  @Prop()
  salePrice: number;

  warehouseQuantity: number;

  @Prop({
    type: [
      {
        color: {
          type: String,
          enum: Color,
          required: true,
          default: Color.Unified,
        },
        quantity: { type: Number, required: true, default: 0 },
      },
    ],
    required: true,
  })
  dimensions: {
    color: string;
    quantity: number;
  }[];

  id: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('marginValue').get(function (this: Product) {
  return this.salePrice - this.costPrice;
});

ProductSchema.virtual('warehouseQuantity').get(function (this: Product) {
  return this.dimensions.reduce((n, { quantity }) => n + quantity, 0);
});
ProductSchema.virtual('id').get(function (this: Product) {
  return this._id;
});
