import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { Order, OrderSchema } from 'src/modules/orders/order.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { Basket, BasketSchema } from './basket.entity';
import { ProductAvailabilityService } from 'src/modules/products/service/product-availability.service';
import { Product, ProductSchema } from 'src/modules/products/product.entity';
import { AttributesModule } from '../attributes/attributes.module';
import { Dimension, DimensionSchema } from 'src/common/entity/dimension.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dimension.name, schema: DimensionSchema },
    ]),
    MongooseModule.forFeature([{ name: Basket.name, schema: BasketSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    UsersModule,
    ProductsModule,
    AuthModule,
    AttributesModule,
  ],
  controllers: [BasketController],
  providers: [BasketService, ProductAvailabilityService],
  exports: [BasketService],
})
export class BasketModule {}
