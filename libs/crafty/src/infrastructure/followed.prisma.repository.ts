import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FollowedRepository } from '../application/followed.repository';

@Injectable()
export class PrismaFollowedRepository implements FollowedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async followUser({
    user,
    userToFollow,
  }: {
    user: string;
    userToFollow: string;
  }): Promise<void> {
    await this.upsertUser(user);
    await this.upsertUser(userToFollow);
    await this.prisma.user.update({
      where: {
        name: user,
      },
      data: {
        following: {
          connectOrCreate: [
            {
              where: { name: userToFollow },
              create: { name: userToFollow },
            },
          ],
        },
      },
    });
  }
  async getFollowedOfUser(user: string): Promise<string[]> {
    const userFromDB = await this.prisma.user.findFirstOrThrow({
      where: { name: user },
      include: { following: true },
    });
    return userFromDB.following.map((f) => f.name);
  }

  private async upsertUser(user: string) {
    await this.prisma.user.upsert({
      where: { name: user },
      update: {
        name: user,
      },
      create: {
        name: user,
      },
    });
  }
}
