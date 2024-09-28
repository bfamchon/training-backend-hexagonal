import { MessageTooLongError } from '../domain/message';
import { messageBuilder } from './message.builder';
import { createMessagingFixture, MessagingFixture } from './messaging.fixture';

describe('Feature: editing a message', () => {
  let fixture: MessagingFixture;
  beforeEach(() => {
    fixture = createMessagingFixture();
  });
  describe('Rule: The edited text should not be superior to 200 chars', () => {
    test('Alice can edit her message to a text inferior to 200 chars', async () => {
      const aliceMessageBuilder = messageBuilder()
        .withId('message-id')
        .withText('Hello')
        .publishedAt(new Date('2023-09-26T10:00:00.000Z'));
      await fixture.givenTheFollowingMessagesExist([aliceMessageBuilder.build()]);
      await fixture.whenUserEditsMessage({
        messageId: 'message-id',
        text: 'Hello world*'
      });

      await fixture.thenMessageShouldBe(aliceMessageBuilder.withText('Hello world*').build());
    });

    test('Alice cannot edit her message to a text superior to 280 chars', async () => {
      const textWithLengthOf281 =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mauris lacus, fringilla eu est vitae, varius viverra nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vivamus suscipit feugiat sollicitudin. Aliquam erat volutpat amet.';

      const originalAliceMessage = messageBuilder()
        .withId('message-id')
        .withText('Hello')
        .publishedAt(new Date('2023-09-26T10:00:00.000Z'))
        .build();
      await fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

      await fixture.whenUserEditsMessage({
        messageId: 'message-id',
        text: textWithLengthOf281
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });
});
