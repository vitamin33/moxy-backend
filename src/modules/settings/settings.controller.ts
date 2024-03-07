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
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { Media } from './media.entity';
import { AddMediaDto } from './dto/add-media.dto';
import { ActivateHomeMediaDto } from './dto/activate-home-media.dto';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('media/add')
  @UseInterceptors(FileInterceptor('media'))
  async addMediaItemWithSingleFile(
    @Body() dto: AddMediaDto,
    @UploadedFile() media,
  ): Promise<Media> {
    return this.settingsService.addMedia(dto, media);
  }

  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('media'))
  @UseGuards(RolesGuard)
  @Post('media/add-set')
  async addMediaItemWithMultipleFiles(
    @Body() dto: AddMediaDto,
    @UploadedFiles() media,
  ): Promise<Media> {
    return this.settingsService.addMediaWithMultipleFiles(dto, media);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('media/:id')
  async removeMedia(@Param('id') id: string): Promise<void> {
    await this.settingsService.removeMedia(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('media/activate-home')
  async activateHomeMedia(@Body() dto: ActivateHomeMediaDto) {
    return this.settingsService.activateHomeMedia(dto);
  }

  @Get('media/home')
  async getHomeMedia() {
    return this.settingsService.getHomeMedia();
  }

  @UseGuards(RolesGuard)
  @Get('media')
  async getAllMedia() {
    return this.settingsService.getAllMedia();
  }
}
