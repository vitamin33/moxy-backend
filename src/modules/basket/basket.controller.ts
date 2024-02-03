import {
  Controller,
  UseGuards,
  Request,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { BasketService } from './basket.service';
import { Basket } from './basket.entity';
import { AddOrChangeProductDto } from './dto/add-change-product.dto';
import { RemoveProductDto } from './dto/remove-product.dto';

@ApiTags('Basket')
@Controller('basket')
@UseGuards(JwtAuthGuard)
export class BasketController {
  constructor(private readonly basketService: BasketService) {}
  @ApiOperation({ summary: 'Get basket for user' })
  @ApiResponse({ status: 200, type: [Basket] })
  @Get()
  async getBasket(@Request() req: any) {
    const userId = req.user.id;
    const guestId = req.guestId;
    return this.basketService.getBasket(userId, guestId);
  }
  @ApiOperation({ summary: 'Add product to basket' })
  @ApiResponse({ status: 200, type: Basket })
  @UsePipes(ValidationPipe)
  @Post('add-change')
  async addOrChangeProduct(
    @Request() req: any,
    @Body() addDto: AddOrChangeProductDto,
  ) {
    const userId = req.user.id;
    const guestId = req.guestId;
    return this.basketService.addOrChangeProduct(userId, guestId, addDto);
  }

  @ApiOperation({ summary: 'Add product to basket' })
  @ApiResponse({ status: 200, type: Basket })
  @UsePipes(ValidationPipe)
  @Post('remove')
  async removeProduct(
    @Request() req: any,
    @Body() removeDto: RemoveProductDto,
  ) {
    const userId = req.user.id;
    return this.basketService.removeProduct(userId, removeDto);
  }

  @ApiOperation({ summary: 'Clear basket' })
  @ApiResponse({ status: 200 })
  @UsePipes(ValidationPipe)
  @Get('clear')
  async clearBasket(@Request() req: any) {
    const userId = req.user.id;
    return this.basketService.clearBasket(userId);
  }
}
