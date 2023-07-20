import { Injectable } from '@nestjs/common';
import { DashboardDto } from './dto/dashboard.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from 'src/orders/order.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { Model } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}
  getOrdersDashboard(dto: DashboardDto) {
    return {};
  }
}
