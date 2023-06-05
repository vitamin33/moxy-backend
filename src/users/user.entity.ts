import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';
import mongoose, { ObjectId } from 'mongoose';
import { Order } from 'src/orders/order.entity';
import { Role } from 'src/roles/role.entity';

export type UserDocument = User & Document;

@Schema()
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

  @ApiProperty({ example: 24, description: 'Nova Poshta number' })
  @Prop()
  novaPoshtaNumber: number;

  @ApiProperty({ example: 243, description: 'Nova Poshta machine number' })
  @Prop()
  novaPostMachineNumber: number;

  @ApiProperty({ example: 12, description: 'Ukr Post number for delivering' })
  @Prop()
  ukrPostNumber: number;

  @ApiProperty({ example: 'crazyded@gmail.com', description: 'Email' })
  @Prop()
  email: string;

  @Exclude()
  @Prop()
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: Role;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  })
  @Type(() => Order)
  orders: Order[];
}

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
