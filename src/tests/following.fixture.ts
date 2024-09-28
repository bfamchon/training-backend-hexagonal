import { FollowUserCommand, FollowUserUseCase } from '../application/usecases/follow-user.usecase';
import { InMemoryFollowedRepository } from '../infrastructure/followed.inmemory.repository';

export const createFollowingFixture = () => {
  const followedRepository = new InMemoryFollowedRepository();
  const followUserUseCase = new FollowUserUseCase(followedRepository);
  return {
    givenUserFollowed({ user, followed }: { user: string; followed: string[] }) {
      followedRepository.givenUserFollowed({ user, followed });
    },
    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);
    },
    async thenUserFollowedAre({ user, followed }: { user: string; followed: string[] }) {
      const userWithFollowed = await followedRepository.getFollowedOfUser(user);
      expect({ user, followed }).toEqual({
        user,
        followed: userWithFollowed
      });
    },
    followedRepository
  };
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>;
