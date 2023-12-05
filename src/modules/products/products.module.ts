import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './service/products.service';
import { Product, ProductSchema } from './product.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from 'src/modules/storage/storage.module';
import { ImportProductsService } from './service/import-products.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';
import {
  Color,
  ColorSchema,
  Material,
  MaterialSchema,
  Size,
  SizeSchema,
} from '../attributes/attribute.entity';
import { AttributesModule } from '../attributes/attributes.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { ProductAdvantagesController } from './product-advantages.controller';
import { ProductAdvantagesService } from './service/product-advantages.service';
import {
  ProductAdvantages,
  ProductAdvantagesSchema,
} from './product-advantages.entity';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Dimension.name, schema: DimensionSchema },
      { name: Color.name, schema: ColorSchema },
      { name: Size.name, schema: SizeSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([
      { name: ProductAdvantages.name, schema: ProductAdvantagesSchema },
    ]),
    StorageModule,
    SettingsModule,
    AttributesModule,
    FavoritesModule,
  ],
  controllers: [ProductsController, ProductAdvantagesController],
  providers: [ProductsService, ProductAdvantagesService, ImportProductsService],
  exports: [ProductsService],
})
export class ProductsModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
