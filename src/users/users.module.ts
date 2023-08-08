import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';
import { Role, RoleSchema } from 'src/roles/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { Order, OrderSchema } from 'src/orders/order.entity';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { NovaPoshtaModule } from 'src/nova-poshta/nova-poshta.module';
import { FavoritesService } from './favorites.service';
import { ProductsModule } from 'src/products/products.module';
import { Product, ProductSchema } from 'src/products/product.entity';
import { FavoritesController } from './favourites.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    RolesModule,
    forwardRef(() => AuthModule),
    NovaPoshtaModule,
    ProductsModule,
  ],
  controllers: [UsersController, FavoritesController],
  providers: [UsersService, FavoritesService],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
