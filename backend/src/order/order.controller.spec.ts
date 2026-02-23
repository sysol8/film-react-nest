import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  const orderServiceMock = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: orderServiceMock,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);

    jest.clearAllMocks();
  });

  describe('order', () => {
    it('должен вызвать orderService.createOrder(dto) и вернуть total/items', async () => {
      const dto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79990000000',
        tickets: [
          {
            film: 'film-1',
            session: 'session-1',
            row: 3,
            seat: 7,
          },
          {
            film: 'film-2',
            session: 'session-2',
            row: 5,
            seat: 2,
          },
        ],
      };

      const createdItems = [
        {
          id: 'order-item-1',
          film: 'film-1',
          session: 'session-1',
          row: 3,
          seat: 7,
        },
        {
          id: 'order-item-2',
          film: 'film-2',
          session: 'session-2',
          row: 5,
          seat: 2,
        },
      ] as any[];

      orderService.createOrder.mockResolvedValue(createdItems);

      const result = await controller.order(dto);

      expect(orderService.createOrder).toHaveBeenCalledTimes(1);
      expect(orderService.createOrder).toHaveBeenCalledWith(dto);

      expect(result).toEqual({
        total: 2,
        items: createdItems,
      });
    });

    it('должен вернуть total=0, если сервис вернул пустой массив', async () => {
      const dto: CreateOrderDto = {
        email: 'empty@example.com',
        phone: '+70000000000',
        tickets: [],
      };

      orderService.createOrder.mockResolvedValue([]);

      const result = await controller.order(dto);

      expect(orderService.createOrder).toHaveBeenCalledTimes(1);
      expect(orderService.createOrder).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });
});
