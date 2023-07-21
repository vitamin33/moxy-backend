import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/role-auth.decorator';
import { DashboardDto } from './dto/dashboard.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get orders dashboard' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Post('orders')
  async getOrdersDashboard(@Body() dto: DashboardDto) {
    return this.dashboardService.getOrdersDashboard(dto);
  }
}
