import { DateProvider } from '../application/date.provider';
import { TimelinePresenter } from '../application/timeline.presenter';
import { Timeline } from '../domain/timeline';

export class DefaultTimelinePresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) {}
  show(timeline: Timeline): {
    author: string;
    text: string;
    publicationTime: string;
  }[] {
    const messages = timeline.data;
    return messages.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt)
    }));
  }

  private publicationTime(publishedAt: Date) {
    const now = this.dateProvider.getNow();
    const ONE_MINUTE_MS = 60000;
    const TWO_MINUTE_MS = 120000;
    const elapsedTime = now.getTime() - publishedAt.getTime();
    if (elapsedTime < ONE_MINUTE_MS) return 'Less than a minute ago';
    else if (elapsedTime < TWO_MINUTE_MS) {
      return '1 minute ago';
    }
    const timeAgo = Math.floor(elapsedTime / ONE_MINUTE_MS);
    return `${timeAgo} minutes ago`;
  }
}
