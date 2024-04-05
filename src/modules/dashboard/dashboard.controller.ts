import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/role-auth.decorator';
import { DashboardDto } from './dto/dashboard.dto';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
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

  @ApiOperation({ summary: 'Get product stats' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Post('product-stats')
  async getProductStats(@Body() dto: DashboardDto) {
    return this.dashboardService.getProductStatistics(dto);
  }
}
