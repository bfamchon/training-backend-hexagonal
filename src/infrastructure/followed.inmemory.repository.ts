import { FollowedRepository } from './../application/followed.repository';
export class InMemoryFollowedRepository implements FollowedRepository {
  userFollowed = new Map<string, string[]>();

  givenUserFollowed({ user, followed }: { user: string; followed: string[] }) {
    this.saveFollowedForUser({ user, followed });
  }

  saveFollowedForUser({ user, followed }: { user: string; followed: string[] }): Promise<void> {
    this.userFollowed.set(user, followed);
    return Promise.resolve();
  }

  followUser({ user, userToFollow }: { user: string; userToFollow: string }): Promise<void> {
    const userToAddFollowed = this.userFollowed.get(user) ?? [];
    userToAddFollowed.push(userToFollow);
    this.userFollowed.set(user, userToAddFollowed);

    return Promise.resolve();
  }

  getFollowedOfUser(user: string): Promise<string[]> {
    return Promise.resolve(this.userFollowed.get(user) ?? []);
  }
}
