import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Order } from 'src/modules/orders/order.entity';
import { Product } from 'src/modules/products/product.entity';
import { Role } from 'src/modules/roles/role.entity';
import { AddressBook } from './adressbook.entity';

export type UserDocument = User & Document;

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
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @ApiProperty({ example: 'Anatolii', description: 'First name' })
  @Prop()
  firstName: string;

  @ApiProperty({ example: 'Borsuk', description: 'Second name' })
  @Prop()
  secondName: string;

  @Prop()
  middleName: string;

  @Prop()
  instagram: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  city: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AddressBook' }) 
  addressBook: AddressBook;

  @ApiProperty({ example: 'crazyded@gmail.com', description: 'Email' })
  @Prop()
  email: string;

  @Exclude()
  @Prop()
  password: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: Role;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  })
  @Type(() => Order)
  orders: Order[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  })
  @Type(() => Product)
  favoriteProducts: Product[];

  @ApiProperty({ description: 'User id. This is the same as _id in db.' })
  id: string;
}

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };

UserSchema.virtual('id').get(function (this: User) {
  return this._id;
});
