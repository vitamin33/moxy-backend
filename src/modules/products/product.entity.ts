import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';
import { ProductAdvantages } from './product-advantages.entity';

export enum ProductCategory {
  Bags = 'Bags',
  Accessories = 'Accessories',
  Backpacks = 'Backpacks',
}
class ProductAttributes {
  @ApiProperty({ example: 0, description: 'Weight in grams' })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  weightInGrams: number;

  @ApiProperty({ example: 'Season', description: 'Season' })
  season: string;

  @ApiProperty({ example: 'Furniture', description: 'Furniture' })
  furniture: string;

  @ApiProperty({ example: 'Strap', description: 'Strap' })
  strap: string;

  @ApiProperty({ example: 0, description: 'Height in cm' })
  @Transform(({ value }) => parseInt(value))
  heightInCm: number;

  @ApiProperty({ example: 0, description: 'Width in cm' })
  @Transform(({ value }) => parseInt(value))
  widthInCm: number;

  @ApiProperty({ example: 0, description: 'Length in cm' })
  @Transform(({ value }) => parseInt(value))
  lengthInCm: number;

  @ApiProperty({ example: 0, description: 'Depth in cm' })
  @Transform(({ value }) => parseInt(value))
  depthInCm: number;

  @ApiProperty({ example: 'Producer', description: 'Producer' })
  producer: string;
}

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
  timestamps: true,
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

  @ApiProperty({ example: 2.3, description: 'Sale price in UAH' })
  @Prop()
  salePrice: number;

  warehouseQuantity: number;

  @ApiProperty({ description: 'Array of Dimension objects for this product.' })
  @Prop({ type: [DimensionSchema], default: [] }) // Use the DimensionSchema here
  dimensions: Dimension[];

  @ApiProperty({
    description: 'Attributes of the product',
    type: ProductAttributes,
  })
  @Prop({ type: ProductAttributes })
  attributes: ProductAttributes;

  @ApiProperty({
    enum: ProductCategory,
    description: 'Product category',
    default: ProductCategory.Bags,
  })
  @Prop({ enum: ProductCategory, default: ProductCategory.Bags })
  category: ProductCategory;

  id: string;

  @Prop({ default: 0 })
  numFavorites: number;

  @ApiProperty({
    example: 0,
    description: 'Discount price in UAH (0 means no discount)',
  })
  @Prop({ default: 0 })
  discountPrice: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the product is for sale',
  })
  @Prop({ default: true }) // Default value is true (for sale)
  forSale: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Product creation date',
  })
  @Prop()
  createdAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('warehouseQuantity').get(function (this: Product) {
  return this.dimensions.reduce((n, { quantity }) => n + quantity, 0);
});
ProductSchema.virtual('id').get(function (this: Product) {
  return this._id;
});

export interface FavoriteProduct extends Product {
  isFavorite: boolean;
}

export interface ProductWithRelatedInfo extends Product {
  costPrice: number;
  productAdvantages: ProductAdvantages[];
}

function isProduct(value: any): value is Product {
  return (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

export function extractProductId(
  product: mongoose.Schema.Types.ObjectId | Product,
): string {
  if (product instanceof mongoose.Types.ObjectId) {
    return product.toString();
  } else if (
    '_id' in product &&
    product._id instanceof mongoose.Types.ObjectId
  ) {
    return product._id.toString();
  } else {
    throw new Error(
      'Invalid product type provided. Expected ObjectId or Product with _id.',
    );
  }
}
