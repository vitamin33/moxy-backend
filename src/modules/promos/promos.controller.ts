import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddPromoDto } from './dto/add-promo.dto';
import { Promo } from './promo.entity';
import { PromosService } from './promos.service';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async addPromo(
    @Body() addPromoDto: AddPromoDto,
    @UploadedFile() image,
  ): Promise<Promo> {
    return this.promosService.addPromo(addPromoDto, image);
  }

  @Get()
  async getPromos(): Promise<Promo[]> {
    return this.promosService.getPromos();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removePromo(@Param('id') id: string): Promise<void> {
    await this.promosService.removePromo(id);
  }
}
