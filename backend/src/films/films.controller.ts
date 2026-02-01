import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmListItemDto } from './dto/film-list-item.dto';
import { ScheduleItemDto } from './dto/schedule-item.dto';
import { ApiListResponseDto } from '../common/dto/api-list-response.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<ApiListResponseDto<FilmListItemDto>> {
    const items = await this.filmsService.getFilms();
    return { total: items.length, items };
  }

  @Get(':id/schedule')
  async getSchedule(
    @Param('id') id: string,
  ): Promise<ApiListResponseDto<ScheduleItemDto>> {
    const film = await this.filmsService.getFilm(id);
    if (!film) throw new NotFoundException('Film not found');
    const items = film.schedule ?? [];
    return { total: items.length, items };
  }
}
