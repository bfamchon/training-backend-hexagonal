import { Message } from './message';

export class Timeline {
  constructor(private readonly messages: Message[], private readonly now: Date) {}

  get data() {
    this.messages.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

    return this.messages.map((msg) => ({
      author: msg.author,
      text: msg.text,
      publicationTime: this.publicationTime(msg.publishedAt)
    }));
  }

  private publicationTime(publishedAt: Date) {
    const ONE_MINUTE_MS = 60000;
    const TWO_MINUTE_MS = 120000;
    const elapsedTime = this.now.getTime() - publishedAt.getTime();
    if (elapsedTime < ONE_MINUTE_MS) return 'Less than a minute ago';
    else if (elapsedTime < TWO_MINUTE_MS) {
      return '1 minute ago';
    }
    const timeAgo = Math.floor(elapsedTime / ONE_MINUTE_MS);
    return `${timeAgo} minutes ago`;
  }
}
