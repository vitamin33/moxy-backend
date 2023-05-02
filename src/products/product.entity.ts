import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

type FullProductDocument = Product & Document;
export type ProductDocument = HydratedDocument<FullProductDocument>;

@Schema()
export class Product {
  @ApiProperty({ example: 'Bag', description: 'Product name' })
  @Prop()
  name: string;

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

  @ApiProperty({ example: 24, description: 'Quantity of product on warehouse' })
  @Prop({ default: 0 })
  warehouseQuantity: number;

  @ApiProperty({ example: 'red', description: 'Product color' })
  @Prop()
  color: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('marginValue').get(function (this: Product) {
  return this.salePrice - this.costPrice;
});
