describe('Feature: Following a user', () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
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

const createFixture = () => {
  return {
    givenUserFollowed({ user, followed }: { user: string; followed: string[] }) {},
    whenUserFollows({ user, userToFollow }: { user: string; userToFollow: string }) {},
    thenUserFollowedAre({ user, followed }: { user: string; followed: string[] }) {}
  };
};

type Fixture = ReturnType<typeof createFixture>;
