import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BasketModule } from './modules/basket/basket.module';
import { PromosModule } from './modules/promos/promos.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PaymentModule } from './modules/payment/payment.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    MongooseModule.forRoot(process.env.MONGODB_CONFIG, {
      dbName: process.env.DB_NAME,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    DashboardModule,
    ProfileModule,
    BasketModule,
    PromosModule,
    SettingsModule,
    AttributesModule,
    PaymentModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {}
}
