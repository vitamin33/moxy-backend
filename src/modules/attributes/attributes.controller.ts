import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AttributesService } from './attributes.service';
import { AddColorDto } from './dto/add-color.dto';
import { AddSizeDto } from './dto/add-size.dto';
import { AddMaterialDto } from './dto/add-material.dto';

@UseGuards(JwtAuthGuard)
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async getAttributes() {
    return this.attributesService.getAttributes();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('colors')
  async addColor(@Body() addColorDto: AddColorDto) {
    return this.attributesService.addColor(addColorDto);
  }

  @Get('colors')
  async getColors() {
    return this.attributesService.getColors();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('colors/:id')
  async removeColor(@Param('id') id: string) {
    await this.attributesService.removeColor(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('materials')
  async addMaterial(@Body() addMaterialDto: AddMaterialDto) {
    return this.attributesService.addMaterial(addMaterialDto);
  }

  @Get('materials')
  async getMaterials() {
    return this.attributesService.getMaterials();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('materials/:id')
  async removeMaterial(@Param('id') id: string) {
    await this.attributesService.removeMaterial(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('sizes')
  async addSize(@Body() addSizeDto: AddSizeDto) {
    return this.attributesService.addSize(addSizeDto);
  }

  @Get('sizes')
  async getSizes() {
    return this.attributesService.getSizes();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('sizes/:id')
  async removeSize(@Param('id') id: string) {
    await this.attributesService.removeSize(id);
  }
}
