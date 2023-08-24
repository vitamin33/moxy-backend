import { Module } from '@nestjs/common';
import { MonobankService } from './monobank.service';

@Module({
  providers: [MonobankService],
  exports: [MonobankService],
})
export class MonobankModule {}
