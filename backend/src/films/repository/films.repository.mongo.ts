import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository';

@Injectable()
export class FilmsRepositoryMongo extends AppRepository {}
