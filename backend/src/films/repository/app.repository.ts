import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { FilmDto } from '../dto/film.dto';
import { FilmListItemDto } from '../dto/film-list-item.dto';
import { ScheduleItemDto } from '../dto/schedule-item.dto';
import { Film } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmsRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmListItemDto[]> {
    const films = await this.filmsRepository.find({
      select: {
        id: true,
        rating: true,
        director: true,
        tags: true,
        image: true,
        cover: true,
        title: true,
        about: true,
        description: true,
      },
    });

    return films.map((film) => ({
      ...film,
      tags: this.parseCsvList(film.tags),
    }));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmsRepository.findOne({
      where: { id },
    });

    if (!film) {
      return null;
    }

    const schedule = await this.scheduleRepository.find({
      where: { filmId: id },
      order: { daytime: 'ASC' },
    });

    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: this.parseCsvList(film.tags),
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      schedule: schedule.map((item) => this.toScheduleDto(item)),
    };
  }

  async getScheduleItem(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto> {
    const session = await this.scheduleRepository.findOne({
      where: { filmId, id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Film or session not found');
    }

    return this.toScheduleDto(session);
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seatKeys: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Schedule);

      const session = await repo
        .createQueryBuilder('schedule')
        .setLock('pessimistic_write')
        .where('schedule.filmId = :filmId', { filmId })
        .andWhere('schedule.id = :sessionId', { sessionId })
        .getOne();

      if (!session) {
        throw new NotFoundException('Film or session not found');
      }

      const taken = new Set(this.parseCsvList(session.taken));
      const conflicts = seatKeys.filter((key) => taken.has(key));

      if (conflicts.length) {
        throw new ConflictException(
          `Seats already taken: ${conflicts.join(', ')}`,
        );
      }

      for (const key of seatKeys) {
        taken.add(key);
      }

      session.taken = [...taken].join(',');
      await repo.save(session);
    });
  }

  private toScheduleDto(schedule: Schedule): ScheduleItemDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: this.parseCsvList(schedule.taken),
    };
  }

  private parseCsvList(value: string | null | undefined): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
