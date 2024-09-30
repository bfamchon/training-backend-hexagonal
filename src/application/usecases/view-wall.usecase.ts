import { Timeline } from '../../domain/timeline';
import { FollowedRepository } from '../followed.repository';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

export class ViewUserWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followedRepository: FollowedRepository
  ) {}
  async handle({ user }: { user: string }, wallPresenter: TimelinePresenter): Promise<void> {
    const followed = await this.followedRepository.getFollowedOfUser(user);

    const messages = (
      await Promise.all([user, ...followed].map((user) => this.messageRepository.getAllOfUser(user)))
    ).flat();

    const timeline = new Timeline(messages);
    wallPresenter.show(timeline);
  }
}
