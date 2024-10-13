import { Injectable } from '@nestjs/common';
import { FollowedRepository } from '../followed.repository';

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

@Injectable()
export class FollowUserUseCase {
  constructor(private readonly followedRepository: FollowedRepository) {}

  async handle(followUserCommand: FollowUserCommand) {
    await this.followedRepository.followUser(followUserCommand);
  }
}
