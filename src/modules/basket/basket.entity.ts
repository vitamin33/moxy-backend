import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';
import { User } from 'src/modules/users/user.entity';
import { Product } from '../products/product.entity';

export type BasketDocument = Basket & Document;
export type BasketItemDocument = BasketItem & Document;

@Schema()
export class BasketItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name })
  product: mongoose.Schema.Types.ObjectId | Product;

  @Prop({ type: [DimensionSchema] })
  dimensions: Dimension[];
}

export const BasketItemSchema = SchemaFactory.createForClass(BasketItem);

@Schema({
  timestamps: true,
})
export class Basket {
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  client: User;

  @Prop({ type: [BasketItemSchema], required: true, default: [] })
  basketItems: BasketItem[];

  @Prop({ type: Number, required: true, default: 2000 })
  freeShippingThreshold: number;
}

export const BasketSchema = SchemaFactory.createForClass(Basket);
