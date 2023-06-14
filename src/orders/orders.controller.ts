import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { Order, OrderDocument } from './order.entity';
import { Roles } from 'src/auth/role-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FindByDto } from './dto/find-by.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 200, type: Order })
  @UsePipes(ValidationPipe)
  @Post('create')
  async create(@Body() orderDto: CreateOrderDto): Promise<OrderDocument> {
    return this.ordersService.createOrder(orderDto);
  }

  @ApiOperation({ summary: 'Edit order' })
  @ApiResponse({ status: 200, type: Order })
  @UsePipes(ValidationPipe)
  @Post('edit')
  async edit(@Body() orderDto: ChangeOrderDto): Promise<OrderDocument> {
    return this.ordersService.editOrder(orderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @ApiOperation({ summary: 'Get orders by status' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Post('find')
  async getOrdersBy(@Body() dto: FindByDto): Promise<OrderDocument[]> {
    return this.ordersService.getOrdersBy(dto);
  }
}
