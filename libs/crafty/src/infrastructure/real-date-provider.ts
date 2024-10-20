import { Injectable } from '@nestjs/common';
import { DateProvider } from '../application/date.provider';

@Injectable()
export class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}
