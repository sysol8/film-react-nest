import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Film } from './film.entity';

@Entity('schedules')
@Index(['filmId', 'id'], { unique: true })
export class Schedule {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar' })
  daytime: string;

  @Column({ type: 'int' })
  hall: number;

  @Column({ type: 'int' })
  rows: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'text', default: '' })
  taken: string;

  @Column({ type: 'uuid', nullable: true })
  filmId: string | null;

  @ManyToOne(() => Film, (film) => film.schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filmId', referencedColumnName: 'id' })
  film: Film;
}
