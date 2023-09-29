import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Color, Material, Size } from 'src/modules/attributes/attribute.entity';

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
export class Dimension {
  @ApiProperty({ description: 'Product color id' })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Color.name,
    required: false,
  })
  color?: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'Size id' })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Size.name,
    required: false,
  })
  size?: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'Material id' })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Material.name,
    required: false,
  })
  material?: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: false, default: [] })
  images: string[];
}

export const DimensionSchema = SchemaFactory.createForClass(Dimension);
