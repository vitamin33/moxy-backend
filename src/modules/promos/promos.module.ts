import { Module } from '@nestjs/common';
import { PromosController } from './promos.controller';
import { PromosService } from './promos.service';
import { Promo, PromoSchema } from './promo.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Promo.name, schema: PromoSchema }]),
    ProductsModule,
    StorageModule,
  ],
  controllers: [PromosController],
  providers: [PromosService],
})
export class PromosModule {}
