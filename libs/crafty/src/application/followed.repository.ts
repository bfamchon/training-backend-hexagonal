import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class FollowedRepository {
  abstract followUser({
    user,
    userToFollow,
  }: {
    user: string;
    userToFollow: string;
  }): Promise<void>;
  abstract getFollowedOfUser(user: string): Promise<string[]>;
}
