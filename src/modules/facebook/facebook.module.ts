import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule {}
