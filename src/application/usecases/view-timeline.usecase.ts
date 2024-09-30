import { Timeline } from '../../domain/timeline';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle({ user }: { user: string }, timelinePresenter: TimelinePresenter): Promise<void> {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user);
    const timeline = new Timeline(messagesOfUser);

    timelinePresenter.show(timeline);
  }
}
