import { DateProvider } from './date.provider';
import { MessageRepository } from './message.repository';

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user);
    messagesOfUser.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());
    const now = this.dateProvider.getNow();

    return messagesOfUser.map((msg) => ({
      author: msg.author,
      text: msg.text.value,
      publicationTime: this.publicationTime({ now, publishedAt: msg.publishedAt })
    }));
  }

  private publicationTime({ publishedAt, now }: { now: Date; publishedAt: Date }) {
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
