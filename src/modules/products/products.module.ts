import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './service/products.service';
import { Product, ProductSchema } from './product.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from 'src/modules/storage/storage.module';
import { ImportProductsService } from './service/import-products.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ProductAvailabilityService } from './service/product-availability.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    StorageModule,
    SettingsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ImportProductsService],
  exports: [ProductsService],
})
export class ProductsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
