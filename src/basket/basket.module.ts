import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { Order, OrderSchema } from 'src/orders/order.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { Basket, BasketSchema } from './basket.entity';
import { ProductAvailabilityService } from 'src/products/service/product-availability.service';
import { Product, ProductSchema } from 'src/products/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Basket.name, schema: BasketSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    UsersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [BasketController],
  providers: [BasketService, ProductAvailabilityService],
})
export class BasketModule {}
