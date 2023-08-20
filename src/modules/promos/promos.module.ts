import { Module } from '@nestjs/common';
import { PromosController } from './promos.controller';
import { PromosService } from './promos.service';

@Module({
  controllers: [PromosController],
  providers: [PromosService]
})
export class PromosModule {}
