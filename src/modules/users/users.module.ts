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
import { Role, RoleSchema } from 'src/modules/roles/role.entity';
import { RolesModule } from 'src/modules/roles/roles.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Order, OrderSchema } from 'src/modules/orders/order.entity';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { NovaPoshtaModule } from 'src/modules/nova-poshta/nova-poshta.module';
import { FavoritesService } from '../favorites/favorites.service';
import { ProductsModule } from 'src/modules/products/products.module';
import { Product, ProductSchema } from 'src/modules/products/product.entity';
import { FavoritesController } from '../favorites/favorites.controller';
import { AttributesModule } from '../attributes/attributes.module';
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
    AttributesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
