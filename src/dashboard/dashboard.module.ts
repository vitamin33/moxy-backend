import { Module, forwardRef } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.entity';
import { Order, OrderSchema } from 'src/orders/order.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    UsersModule,
    ProductsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
