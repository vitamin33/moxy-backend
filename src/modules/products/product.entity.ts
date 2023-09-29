import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';

type FullProductDocument = Product & Document;
export type ProductDocument = HydratedDocument<FullProductDocument>;

@Schema({
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
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
  @ApiProperty({ example: 5.2, description: 'Cost price in USD' })
  @Prop()
  costPriceInUsd: number;

  @ApiProperty({ example: 300, description: 'Weight in grams' })
  @Prop()
  weightInGrams: number;

  @ApiProperty({ example: 2.3, description: 'Sale price in UAH' })
  @Prop()
  salePrice: number;

  warehouseQuantity: number;

  @ApiProperty({ description: 'Array of Dimension objects for this product.' })
  @Prop({ type: [DimensionSchema], default: [] }) // Use the DimensionSchema here
  dimensions: Dimension[];

  id: string;

  @Prop({ default: 0 })
  numFavorites: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the product is for sale',
  })
  @Prop({ default: true }) // Default value is true (for sale)
  forSale: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('warehouseQuantity').get(function (this: Product) {
  return this.dimensions.reduce((n, { quantity }) => n + quantity, 0);
});
ProductSchema.virtual('id').get(function (this: Product) {
  return this._id;
});
