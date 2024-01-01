import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { SettingsModule } from '../settings/settings.module';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Color.name, schema: ColorSchema }]),
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),
    MongooseModule.forFeature([{ name: Size.name, schema: SizeSchema }]),
    SettingsModule,
  ],
  providers: [AttributesService],
  controllers: [AttributesController],
  exports: [AttributesService],
})
export class AttributesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
