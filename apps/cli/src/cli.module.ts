import { CraftyModule } from '@crafty/crafty';
import { DefaultTimelinePresenter } from '@crafty/crafty/apps/timeline.default.presenter';
import { PrismaFollowedRepository } from '@crafty/crafty/infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infrastructure/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infrastructure/real-date-provider';
import { Module } from '@nestjs/common';
import {
  EditCommand,
  FollowCommand,
  PostCommand,
  ViewCommand,
  WallCommand,
} from './commands';
import { CustomConsoleLogger } from './custom.console.logger';
import { CliTimelinePresenter } from './timeline.cli.presenter';

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
    PostCommand,
    ViewCommand,
    WallCommand,
    EditCommand,
    FollowCommand,
    CliTimelinePresenter,
    CustomConsoleLogger,
    DefaultTimelinePresenter,
  ],
})
export class CliModule {}
