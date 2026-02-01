import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResultDto } from './dto/order-result.dto';
import { ApiListResponseDto } from '../common/dto/api-list-response.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order')
  async order(
    @Body() dto: CreateOrderDto,
  ): Promise<ApiListResponseDto<OrderResultDto>> {
    const items = await this.orderService.createOrder(dto);
    return { total: items.length, items };
  }
}
