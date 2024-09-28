import { EditMessageCommand, EditMessageUseCase } from '../application/usecases/edit-message.usecase';
import { PostMessageCommand, PostMessageUseCase } from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { Message } from '../domain/message';
import { InMemoryMessageRepository } from '../infrastructure/message.inmemory.repository';
import { StubDateProvider } from '../infrastructure/stub-date-provider';

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  let thrownError: Error;
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserSeesTheTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const retrievedMessage = await messageRepository.getMessageById(expectedMessage.id);
      expect(expectedMessage).toEqual(retrievedMessage);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    }
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
