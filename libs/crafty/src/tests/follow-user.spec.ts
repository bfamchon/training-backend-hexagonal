import { createFollowingFixture, FollowingFixture } from './following.fixture';
describe('Feature: Following a user', () => {
  let fixture: FollowingFixture;

  beforeEach(() => {
    fixture = createFollowingFixture();
  });
  test('Alice can follow Bob', async () => {
    fixture.givenUserFollowed({
      user: 'Alice',
      followed: ['Charlie']
    });

    await fixture.whenUserFollows({
      user: 'Alice',
      userToFollow: 'Bob'
    });

    await fixture.thenUserFollowedAre({
      user: 'Alice',
      followed: ['Charlie', 'Bob']
    });
  });
});
