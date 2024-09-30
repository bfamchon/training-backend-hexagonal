import { TimelinePresenter } from '../application/timeline.presenter';
import { Timeline } from '../domain/timeline';
import { DefaultTimelinePresenter } from './timeline.default.presenter';

export class CliTimelinePresenter implements TimelinePresenter {
  constructor(private readonly defaultTimelinePresenter: DefaultTimelinePresenter) {}
  show(timeline: Timeline): void {
    console.table(this.defaultTimelinePresenter.show(timeline));
  }
}
