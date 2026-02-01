import { FilmDto } from '../dto/film.dto';
import { FilmListItemDto } from '../dto/film-list-item.dto';

export abstract class FilmsRepository {
  abstract findAll(): Promise<FilmListItemDto[]>;
  abstract findById(id: string): Promise<FilmDto | null>;
}
