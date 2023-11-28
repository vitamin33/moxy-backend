import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import {
  ProductAdvatages,
  ProductAdvatagesSchema,
} from './product-advatages.entity';
import { ProductAdvatagesController } from './product-advatages.controller';
import { ProductAdvatagesService } from './product-advatages.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ProductAdvatages.name, schema: ProductAdvatagesSchema },
    ]),
    ProductsModule,
    StorageModule,
  ],
  controllers: [ProductAdvatagesController],
  providers: [ProductAdvatagesService],
})
export class ProductAdvatagesModule {}
