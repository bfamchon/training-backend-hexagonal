import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
import { DefaultTimelinePresenter } from '@crafty/crafty/apps/timeline.default.presenter';
import { Timeline } from '@crafty/crafty/domain/timeline';
import { Injectable } from '@nestjs/common';
import { CustomConsoleLogger } from './custom.console.logger';

@Injectable()
export class CliTimelinePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter,
    private readonly logger: CustomConsoleLogger,
  ) {}
  show(timeline: Timeline): void {
    this.logger.table(this.defaultTimelinePresenter.show(timeline));
  }
}
