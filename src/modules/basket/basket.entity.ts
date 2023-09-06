import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Color } from 'src/modules/products/product.entity';
import { User } from 'src/modules/users/user.entity';

export type BasketDocument = Basket & Document;
export type BasketItemDocument = BasketItem & Document;

@Schema()
export class Dimension {
  @Prop({ type: String, enum: Color })
  color: Color;

  @Prop({ type: Number, required: true, default: 0 })
  quantity: number;
}

export const DimensionSchema = SchemaFactory.createForClass(Dimension);

@Schema()
export class BasketItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [DimensionSchema] })
  dimensions: Dimension[];
}

export const BasketItemSchema = SchemaFactory.createForClass(BasketItem);

@Schema({
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  timestamps: true,
})
export class Basket {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  client: User;

  @Prop({ type: [BasketItemSchema], required: true, default: [] })
  basketItems: BasketItem[];

  @Prop({ type: Number, required: true, default: 2000 })
  freeShippingThreshold: number;

  id: string;
}

export const BasketSchema = SchemaFactory.createForClass(Basket);

BasketSchema.virtual('id').get(function (this: Basket) {
  return this._id;
});
