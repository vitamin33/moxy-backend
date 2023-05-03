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
  async getAllOrders(): Promise<OrderDocument[]> {
    return this.ordersService.getAllOrders();
  }
}
