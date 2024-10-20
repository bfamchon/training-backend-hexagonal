import { DateProvider } from '@crafty/crafty/application/date.provider';
import { FollowedRepository } from '@crafty/crafty/application/followed.repository';
import { MessageRepository } from '@crafty/crafty/application/message.repository';
import { EditMessageUseCase } from '@crafty/crafty/application/usecases/edit-message.usecase';
import { FollowUserUseCase } from '@crafty/crafty/application/usecases/follow-user.usecase';
import { PostMessageUseCase } from '@crafty/crafty/application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/view-timeline.usecase';
import { ViewUserWallUseCase } from '@crafty/crafty/application/usecases/view-wall.usecase';
import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DefaultTimelinePresenter } from './apps/timeline.default.presenter';

@Module({})
export class CraftyModule {
  static register(providers: {
    MessageRepository: ClassProvider<MessageRepository>['useClass'];
    FollowedRepository: ClassProvider<FollowedRepository>['useClass'];
    DateProvider: ClassProvider<DateProvider>['useClass'];
    PrismaClient: ClassProvider<PrismaClient>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewUserWallUseCase,
        DefaultTimelinePresenter,
        {
          provide: MessageRepository,
          useClass: providers.MessageRepository,
        },
        {
          provide: FollowedRepository,
          useClass: providers.FollowedRepository,
        },
        {
          provide: DateProvider,
          useClass: providers.DateProvider,
        },
        {
          provide: PrismaClient,
          useClass: providers.PrismaClient,
        },
      ],
      exports: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewUserWallUseCase,
        DefaultTimelinePresenter,
        DateProvider,
      ],
    };
  }
}
