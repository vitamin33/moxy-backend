import { MongooseModule } from '@nestjs/mongoose';
import { NovaPoshtaService } from './nova-poshta.service';
import { Module } from '@nestjs/common';
import { User, UserSchema } from 'src/users/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [NovaPoshtaService],
  exports: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
