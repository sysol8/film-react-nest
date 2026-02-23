import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmDto } from './dto/film.dto';
import { FilmListItemDto } from './dto/film-list-item.dto';
import { ScheduleItemDto } from './dto/schedule-item.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: jest.Mocked<FilmsService>;

  const filmsServiceMock = {
    getFilms: jest.fn(),
    getFilm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: filmsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get(FilmsService);

    jest.clearAllMocks();
  });

  describe('getFilms', () => {
    it('должен вернуть список фильмов с total', async () => {
      const films: FilmListItemDto[] = [
        {
          id: 'film-1',
          rating: 8.4,
          director: 'Christopher Nolan',
          tags: ['sci-fi', 'thriller'],
          image: '/images/interstellar.jpg',
          cover: '/covers/interstellar.jpg',
          title: 'Interstellar',
          about: 'A team travels through a wormhole in space.',
          description: 'Epic science fiction film',
        },
        {
          id: 'film-2',
          rating: 9.0,
          director: 'Frank Darabont',
          tags: ['drama'],
          image: '/images/shawshank.jpg',
          cover: '/covers/shawshank.jpg',
          title: 'The Shawshank Redemption',
          about: 'Hope can set you free.',
          description: 'Drama about friendship and hope',
        },
      ];

      filmsService.getFilms.mockResolvedValue(films);

      const result = await controller.getFilms();

      expect(filmsService.getFilms).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        total: 2,
        items: films,
      });
    });

    it('должен вернуть пустой список, если фильмов нет', async () => {
      filmsService.getFilms.mockResolvedValue([]);

      const result = await controller.getFilms();

      expect(filmsService.getFilms).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('getSchedule', () => {
    it('должен вернуть расписание фильма', async () => {
      const id = 'film-1';

      const schedule: ScheduleItemDto[] = [
        {
          id: 'session-1',
          daytime: '2026-02-23T10:00:00.000Z',
          hall: 1,
          rows: 10,
          seats: 15,
          price: 450,
          taken: ['1:1', '1:2', '3:7'],
        },
        {
          id: 'session-2',
          daytime: '2026-02-23T14:00:00.000Z',
          hall: 2,
          rows: 12,
          seats: 18,
          price: 550,
          taken: ['2:4', '5:6'],
        },
      ];

      const film: FilmDto = {
        id,
        rating: 8.4,
        director: 'Christopher Nolan',
        tags: ['sci-fi', 'thriller'],
        image: '/images/interstellar.jpg',
        cover: '/covers/interstellar.jpg',
        title: 'Interstellar',
        about: 'A team travels through a wormhole in space.',
        schedule,
      };

      filmsService.getFilm.mockResolvedValue(film);

      const result = await controller.getSchedule(id);

      expect(filmsService.getFilm).toHaveBeenCalledTimes(1);
      expect(filmsService.getFilm).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        total: 2,
        items: schedule,
      });
    });

    it('должен вернуть пустой список, если у фильма нет schedule', async () => {
      const id = 'film-without-schedule';

      const filmWithoutSchedule = {
        id,
        rating: 7.1,
        director: 'Some Director',
        tags: ['drama'],
        image: '/images/film.jpg',
        cover: '/covers/film.jpg',
        title: 'Film without schedule',
        about: 'No sessions yet',
        schedule: undefined,
      } as unknown as FilmDto;

      filmsService.getFilm.mockResolvedValue(filmWithoutSchedule);

      const result = await controller.getSchedule(id);

      expect(filmsService.getFilm).toHaveBeenCalledTimes(1);
      expect(filmsService.getFilm).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('должен бросать NotFoundException, если фильм не найден', async () => {
      const id = 'unknown-film';

      filmsService.getFilm.mockResolvedValue(null as unknown as FilmDto);

      await expect(controller.getSchedule(id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getSchedule(id)).rejects.toThrow(
        'Film not found',
      );

      expect(filmsService.getFilm).toHaveBeenCalledTimes(2);
      expect(filmsService.getFilm).toHaveBeenCalledWith(id);
    });
  });
});
