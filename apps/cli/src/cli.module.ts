import { CraftyModule } from '@crafty/crafty';
import { PrismaFollowedRepository } from '@crafty/crafty/infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infrastructure/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infrastructure/real-date-provider';
import { Module } from '@nestjs/common';
import { commands } from 'apps/cli/src/commands';
import { CustomConsoleLogger } from 'apps/cli/src/custom.console.logger';
import { CliTimelinePresenter } from 'apps/cli/src/timeline.cli.presenter';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FollowedRepository: PrismaFollowedRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  controllers: [],
  providers: [
    ...Object.values(commands),
    CliTimelinePresenter,
    CustomConsoleLogger,
  ],
})
export class CliModule {}
