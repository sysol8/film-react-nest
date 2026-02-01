import { Injectable } from '@nestjs/common';
import { FilmsRepository } from './repository/films.repository';
import { FilmDto } from './dto/film.dto';
import { FilmListItemDto } from './dto/film-list-item.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly repository: FilmsRepository) {}

  getFilms(): Promise<FilmListItemDto[]> {
    return this.repository.findAll();
  }

  getFilm(id: string): Promise<FilmDto | null> {
    return this.repository.findById(id);
  }
}
