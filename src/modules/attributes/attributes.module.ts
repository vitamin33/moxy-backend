import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Attributes,
  AttributesSchema,
  Color,
  ColorSchema,
  Material,
  MaterialSchema,
  Size,
  SizeSchema,
} from './attribute.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Color.name, schema: ColorSchema }]),
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),
    MongooseModule.forFeature([{ name: Size.name, schema: SizeSchema }]),
  ],
  providers: [AttributesService],
  controllers: [AttributesController],
  exports: [AttributesService],
})
export class AttributesModule {}
