import { DateProvider } from "./date.provider";
import { MessageRepository } from "./message.repository";

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository,
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
    messagesOfUser.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );
   const now = this.dateProvider.getNow()

    return [
      {
        author: messagesOfUser[0].author,
        text: messagesOfUser[0].text,
        publicationTime: this.publicationTime({now, publishedAt: messagesOfUser[0].publishedAt}),
      },{
        author: messagesOfUser[1].author,
        text: messagesOfUser[1].text,
        publicationTime: this.publicationTime({now, publishedAt: messagesOfUser[1].publishedAt}),
      },
      {
        author: messagesOfUser[2].author,
        text: messagesOfUser[2].text,
        publicationTime: this.publicationTime({now, publishedAt: messagesOfUser[2].publishedAt}),
      },
    ];
  }

  private publicationTime ({publishedAt, now}: {now: Date, publishedAt: Date}) {
    const ONE_MINUTE_MS = 60000;
  const TWO_MINUTE_MS = 120000;
    const elapsedTime = now.getTime() - publishedAt.getTime();
  if (elapsedTime < ONE_MINUTE_MS)
    return "Less than a minute ago"
  else if (elapsedTime < TWO_MINUTE_MS) {
    return '1 minute ago'
  }
  const timeAgo = Math.floor(elapsedTime / ONE_MINUTE_MS)
  return `${timeAgo} minutes ago`
}
}
