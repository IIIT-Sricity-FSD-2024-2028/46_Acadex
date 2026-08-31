import { Injectable } from '@nestjs/common';
import { reports } from '../data';

@Injectable()
export class ReportsService {
  findAll() {
    return reports;
  }
}
