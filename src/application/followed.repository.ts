export interface FollowedRepository {
  followUser({ user, userToFollow }: { user: string; userToFollow: string }): Promise<void>;
  getFollowedOfUser(user: string): Promise<string[]>;
}
