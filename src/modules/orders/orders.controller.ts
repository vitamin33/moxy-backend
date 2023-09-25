import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { Order, OrderDocument } from './order.entity';
import { Roles } from 'src/modules/auth/role-auth.decorator';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FindByDto } from './dto/find-by.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';

@ApiTags('Orders')
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

  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, type: Order })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get(':id')
  async getOrderById(@Param('id') orderId: string) {
    // Call the service method to get the order by ID
    return this.ordersService.getOrderById(orderId);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAllOrders(
    @Query('page') page?: number, // Page number from query
    @Query('limit') limit?: number,
  ) {
    // Default values if not provided
    page = page || 1;
    limit = limit || 10; // You can change the default limit as needed

    // Calculate the skip value based on page and limit
    const skip = (page - 1) * limit;
    return this.ordersService.getPaginatedAllOrders(skip, limit);
  }

  @ApiOperation({ summary: 'Get orders by status' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Post('find')
  async getOrdersBy(
    @Body() dto: FindByDto,
    @Query('page') page?: number, // Page number from query
    @Query('limit') limit?: number,
  ) {
    // Default values if not provided
    page = page || 1;
    limit = limit || 10; // You can change the default limit as needed

    // Calculate the skip value based on page and limit
    const skip = (page - 1) * limit;
    return this.ordersService.getPaginatedOrdersBy(dto, skip, limit);
  }

  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteOrder(@Param('id') orderId: string) {
    await this.ordersService.deleteOrder(orderId);
  }
}
