import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @ApiProperty({ example: 'Anatolii', description: 'First name' })
  @Prop()
  firstName: string;

  @ApiProperty({ example: 'Borsuk', description: 'Second name' })
  @Prop()
  secondName: string;

  @Prop()
  middleName: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  city: string;

  @ApiProperty({ example: 24, description: 'Nova Poshta number' })
  @Prop()
  novaPoshtaNumber: number;

  @ApiProperty({ example: 'crazyded@gmail.com', description: 'Email' })
  @Prop()
  email: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
