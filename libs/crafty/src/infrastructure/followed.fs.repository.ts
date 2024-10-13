import * as fs from 'fs';
import * as path from 'path';
import { FollowedRepository } from '../application/followed.repository';

export class FileSystemFollowedRepository implements FollowedRepository {
  constructor(private readonly followedPath = path.join(__dirname, 'followed.json')) {}

  async followUser({ user, userToFollow }: { user: string; userToFollow: string }): Promise<void> {
    const allFollowed = await this.getAllFollowed();
    const followedOfUser = allFollowed[user] ?? [];
    followedOfUser.push(userToFollow);
    allFollowed[user] = followedOfUser;

    return fs.promises.writeFile(this.followedPath, JSON.stringify(allFollowed));
  }
  async getFollowedOfUser(user: string): Promise<string[]> {
    const allFollowed = await this.getAllFollowed();
    return allFollowed[user] ?? [];
  }

  private async getAllFollowed() {
    const data = await fs.promises.readFile(this.followedPath);
    return JSON.parse(data.toString()) as { [user: string]: string[] | undefined };
  }
}
