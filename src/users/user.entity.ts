import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/role.entity';

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

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }] })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
