export interface FollowedRepository {
  saveFollowedForUser({ user, followed }: { user: string; followed: string[] }): Promise<void>;
  followUser({ user, userToFollow }: { user: string; userToFollow: string }): Promise<void>;
  getFollowedOfUser(user: string): Promise<string[]>;
}
