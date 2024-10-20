import { Injectable } from '@nestjs/common';
import { DateProvider } from './../application/date.provider';

@Injectable()
export class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}
