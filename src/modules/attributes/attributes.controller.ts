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

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async getAttributes() {
    return this.attributesService.getAttributes();
  }

  @Post('colors')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addColor(@Body() addColorDto: AddColorDto) {
    return this.attributesService.addColor(addColorDto);
  }

  @Get('colors')
  async getColors() {
    return this.attributesService.getColors();
  }

  @Delete('colors/:id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeColor(@Param('id') id: string) {
    await this.attributesService.removeColor(id);
  }

  @Post('materials')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addMaterial(@Body() addMaterialDto: AddMaterialDto) {
    return this.attributesService.addMaterial(addMaterialDto);
  }

  @Get('materials')
  async getMaterials() {
    return this.attributesService.getMaterials();
  }

  @Delete('materials/:id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeMaterial(@Param('id') id: string) {
    await this.attributesService.removeMaterial(id);
  }

  @Post('sizes')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addSize(@Body() addSizeDto: AddSizeDto) {
    return this.attributesService.addSize(addSizeDto);
  }

  @Get('sizes')
  async getSizes() {
    return this.attributesService.getSizes();
  }

  @Delete('sizes/:id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeSize(@Param('id') id: string) {
    await this.attributesService.removeSize(id);
  }
}
