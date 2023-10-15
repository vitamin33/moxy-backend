import { MonopayService } from './monopay.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [MonopayService],
  exports: [MonopayService],
})
export class MonopayModule {}
