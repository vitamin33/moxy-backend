import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { Order, OrderSchema } from 'src/orders/order.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { Basket, BasketSchema } from './basket.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Basket.name, schema: BasketSchema }]),
    UsersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
