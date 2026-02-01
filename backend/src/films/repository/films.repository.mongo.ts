import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilmsRepository } from './films.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Film, FilmDocument } from '../schemas/film.schema';
import { Model } from 'mongoose';
import { FilmDto } from '../dto/film.dto';
import { FilmListItemDto } from '../dto/film-list-item.dto';
import { ScheduleItemDto } from '../dto/schedule-item.dto';

@Injectable()
export class FilmsRepositoryMongo implements FilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<FilmListItemDto[]> {
    return this.filmModel
      .find({}, { _id: 0, __v: 0, schedule: 0 })
      .lean<FilmListItemDto[]>()
      .exec();
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmModel
      .findOne({ id }, { _id: 0, __v: 0 })
      .lean<FilmDto>()
      .exec();

    return film ?? null;
  }

  async getScheduleItem(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleItemDto> {
    const film = await this.filmModel
      .findOne(
        { id: filmId },
        { _id: 0, schedule: { $elemMatch: { id: sessionId } } },
      )
      .lean<{ schedule: ScheduleItemDto[] }>()
      .exec();

    const session = film?.schedule?.[0];
    if (!session) {
      throw new NotFoundException('Film or session not found');
    }
    return session;
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seatKeys: string[],
  ): Promise<void> {
    const res = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: { id: sessionId, taken: { $nin: seatKeys } },
          },
        },
        {
          $addToSet: { 'schedule.$.taken': { $each: seatKeys } },
        },
      )
      .exec();

    if (res.modifiedCount === 1) return;

    const session = await this.getScheduleItem(filmId, sessionId);
    const takenSet = new Set(session.taken ?? []);
    const conflicts = seatKeys.filter((k) => takenSet.has(k));

    if (conflicts.length) {
      throw new ConflictException(
        `Seats already taken: ${conflicts.join(', ')}`,
      );
    }
    throw new NotFoundException('Film or session not found');
  }
}
