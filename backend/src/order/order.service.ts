import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResultDto } from './dto/order-result.dto';
import { FilmsRepositoryMongo } from '../films/repository/films.repository.mongo';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepo: FilmsRepositoryMongo) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResultDto[]> {
    if (!dto.tickets?.length) {
      throw new BadRequestException('field tickets is required');
    }

    const localDup = new Set<string>();
    for (const t of dto.tickets) {
      const key = `${t.film}|${t.session}|${t.row}|${t.seat}`;
      if (localDup.has(key)) {
        throw new BadRequestException(`Duplicate ticket in request: ${key}`);
      }
      localDup.add(key);
    }

    const groups = new Map<string, typeof dto.tickets>();
    for (const t of dto.tickets) {
      const gKey = `${t.film}|${t.session}`;
      const arr = groups.get(gKey);
      if (arr) arr.push(t);
      else groups.set(gKey, [t]);
    }

    const results: OrderResultDto[] = [];

    for (const [gKey, tickets] of groups) {
      const [filmId, sessionId] = gKey.split('|');

      const session = await this.filmsRepo.getScheduleItem(filmId, sessionId);

      for (const t of tickets) {
        if (t.row < 1 || t.row > session.rows) {
          throw new BadRequestException(`Row out of range: ${t.row}`);
        }
        if (t.seat < 1 || t.seat > session.seats) {
          throw new BadRequestException(`Seat out of range: ${t.seat}`);
        }
      }

      const seatKeys = tickets.map((t) => `${t.row}:${t.seat}`);

      await this.filmsRepo.reserveSeats(filmId, sessionId, seatKeys);

      for (const t of tickets) {
        results.push({
          id: randomUUID(),
          film: filmId,
          session: sessionId,
          row: t.row,
          seat: t.seat,
          price: session.price,
          daytime: session.daytime,
        });
      }
    }

    return results;
  }
}
