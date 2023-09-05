import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AddressBook extends Document {
  @Prop({ type: String }) 
  city: string;

  @Prop({ type: Number }) 
  novaPoshtaNumber: number;

  @Prop({ type: Number }) 
  novaPostMachineNumber: number;

}

export const AddressBookSchema = SchemaFactory.createForClass(AddressBook);