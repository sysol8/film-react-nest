import { ScheduleItemDto } from './schedule-item.dto';

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  schedule: ScheduleItemDto[];
}
