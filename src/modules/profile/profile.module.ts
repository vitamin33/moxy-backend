import { Module, forwardRef } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UsersModule } from 'src/modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { NewsletterService } from './newsletter.service';
import { Subscriber, SubscriberSchema } from './subscriber.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
    AuthModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, NewsletterService],
})
export class ProfileModule {}
