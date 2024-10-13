import { CraftyModule } from '@crafty/crafty';
import { PrismaFollowedRepository } from '@crafty/crafty/infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infrastructure/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infrastructure/real-date-provider';
import { Module } from '@nestjs/common';
import { ApiController } from 'apps/api/src/api.controller';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FollowedRepository: PrismaFollowedRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
