import { ConsoleLogger } from '@nestjs/common';

export class CustomConsoleLogger extends ConsoleLogger {
  table(data: any) {
    console.table(data);
  }
}
