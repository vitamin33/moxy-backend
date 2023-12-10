import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './media.entity';
import { StorageModule } from '../storage/storage.module';
import { SettingsController } from './settings.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    StorageModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
