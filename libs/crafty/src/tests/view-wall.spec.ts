import { DefaultTimelinePresenter } from '../../../../apps/cli/src/timeline.default.presenter';
import { MessageRepository } from '../application/message.repository';
import { TimelinePresenter } from '../application/timeline.presenter';
import { ViewUserWallUseCase } from '../application/usecases/view-wall.usecase';
import { StubDateProvider } from '../infrastructure/stub-date-provider';
import { FollowedRepository } from './../application/followed.repository';
import { createFollowingFixture, FollowingFixture } from './following.fixture';
import { messageBuilder } from './message.builder';
import { createMessagingFixture, MessagingFixture } from './messaging.fixture';

describe('Feature: viewing user wall', () => {
  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followingFixture: FollowingFixture;

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followingFixture = createFollowingFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followedRepository: followingFixture.followedRepository,
    });
  });
  describe('Rule: all messages from user and her followed should appear in reverse chronological order', () => {
    test('Charlie has subscribed to Alice and so can view an aggregated list of all subscription', async () => {
      fixture.givenNowIs(new Date('2023-02-07T16:30:00.000Z'));
      messagingFixture.givenTheFollowingMessagesExist([
        messageBuilder()
          .authoredBy('Alice')
          .withId('message-1')
          .withText('My first message')
          .publishedAt(new Date('2023-02-07T16:28:00.000Z'))
          .build(),
        messageBuilder()
          .authoredBy('Bob')
          .withId('message-2')
          .withText("Hi it's Bob")
          .publishedAt(new Date('2023-02-07T16:29:00.000Z'))
          .build(),
        messageBuilder()
          .authoredBy('Charlie')
          .withId('message-3')
          .withText('How are you all ?')
          .publishedAt(new Date('2023-02-07T16:30:00.000Z'))
          .build(),
      ]);

      followingFixture.givenUserFollowed({
        user: 'Charlie',
        followed: ['Alice'],
      });

      await fixture.whenUserLookForTheWallOf('Charlie');

      fixture.thenUserShouldSee([
        {
          author: 'Charlie',
          text: 'How are you all ?',
          publicationTime: 'Less than a minute ago',
        },
        {
          author: 'Alice',
          text: 'My first message',
          publicationTime: '2 minutes ago',
        },
      ]);
    });
  });
});

const createFixture = ({
  messageRepository,
  followedRepository,
}: {
  followedRepository: FollowedRepository;
  messageRepository: MessageRepository;
}) => {
  let wall: {
    author: string;
    text: string;
    publicationTime: string;
  }[];

  const dateProvider = new StubDateProvider();
  const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
  const viewUserWallUseCase = new ViewUserWallUseCase(
    messageRepository,
    followedRepository,
  );
  const wallPresenter: TimelinePresenter = {
    show(_timeline) {
      wall = defaultWallPresenter.show(_timeline);
    },
  };
  return {
    givenNowIs(date: Date) {
      dateProvider.now = date;
    },
    thenUserShouldSee(
      expectedWall: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(wall).toEqual(expectedWall);
    },
    async whenUserLookForTheWallOf(user: string) {
      await viewUserWallUseCase.handle({ user }, wallPresenter);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
