import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './product.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from 'src/storage/storage.module';
import { ImportProductsService } from './import-products.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    StorageModule,
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
