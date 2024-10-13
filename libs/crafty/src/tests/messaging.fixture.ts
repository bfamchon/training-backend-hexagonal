import { DefaultTimelinePresenter } from '../../../../apps/cli/src/timeline.default.presenter';
import { TimelinePresenter } from '../application/timeline.presenter';
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../application/usecases/edit-message.usecase';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { Message } from '../domain/message';
import { InMemoryMessageRepository } from '../infrastructure/message.inmemory.repository';
import { StubDateProvider } from '../infrastructure/stub-date-provider';

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider,
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);

  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  let thrownError: Error;
  const timelinePresenter: TimelinePresenter = {
    show(_timeline) {
      timeline = defaultTimelinePresenter.show(_timeline);
    },
  };
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserSeesTheTimelineOf(user: string) {
      await viewTimelineUseCase.handle({ user }, timelinePresenter);
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const retrievedMessage = await messageRepository.getMessageById(
        expectedMessage.id,
      );
      expect(expectedMessage).toEqual(retrievedMessage);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
