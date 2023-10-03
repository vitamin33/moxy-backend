import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Attributes, AttributesSchema } from './attribute.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Attributes.name, schema: AttributesSchema },
    ]),
  ],
  providers: [AttributesService],
  controllers: [AttributesController],
  exports: [AttributesService],
})
export class AttributesModule {}
