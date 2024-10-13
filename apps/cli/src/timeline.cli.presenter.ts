import { Injectable } from '@nestjs/common';
import { CustomConsoleLogger } from 'apps/cli/src/custom.console.logger';
import { TimelinePresenter } from '../../../libs/crafty/src/application/timeline.presenter';
import { Timeline } from '../../../libs/crafty/src/domain/timeline';
import { DefaultTimelinePresenter } from './timeline.default.presenter';

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
