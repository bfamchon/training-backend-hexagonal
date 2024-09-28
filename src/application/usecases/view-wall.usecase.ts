import { Timeline } from '../../domain/timeline';
import { DateProvider } from '../date.provider';
import { FollowedRepository } from '../followed.repository';
import { MessageRepository } from '../message.repository';

export class ViewUserWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followedRepository: FollowedRepository,
    private readonly dateProvider: DateProvider
  ) {}
  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const followed = await this.followedRepository.getFollowedOfUser(user);

    const messages = (
      await Promise.all([user, ...followed].map((user) => this.messageRepository.getAllOfUser(user)))
    ).flat();

    const timeline = new Timeline(messages, this.dateProvider.getNow());
    return timeline.data;
  }
}
