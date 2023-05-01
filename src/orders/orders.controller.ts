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

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAllUsers(): Promise<OrderDocument[]> {
    return this.ordersService.getAllOrders();
  }
}
