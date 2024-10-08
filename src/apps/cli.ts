#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { Command } from 'commander';
import { EditMessageCommand, EditMessageUseCase } from '../application/usecases/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '../application/usecases/follow-user.usecase';
import { PostMessageCommand, PostMessageUseCase } from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { ViewUserWallUseCase } from '../application/usecases/view-wall.usecase';
import { PrismaFollowedRepository } from '../infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '../infrastructure/message.prisma.repository';
import { RealDateProvider } from '../infrastructure/real-date-provider';
import { CliTimelinePresenter } from './timeline.cli.presenter';
import { DefaultTimelinePresenter } from './timeline.default.presenter';

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const followedRepository = new PrismaFollowedRepository(prismaClient);
const followUserUseCase = new FollowUserUseCase(followedRepository);
const viewUserWallUseCase = new ViewUserWallUseCase(messageRepository, followedRepository);
const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const timelinePresenter = new CliTimelinePresenter(defaultTimelinePresenter);

const program = new Command();
program
  .version('1.0.0')
  .description('Hexagonal training')
  .addCommand(
    new Command('post')
      .argument('<user>', 'the current user')
      .argument('<message>', 'the message to post')
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 100000)}`,
          author: user,
          text: message
        };
        try {
          const result = await postMessageUseCase.handle(postMessageCommand);
          if (result.isOk()) {
            console.log('✅ Message posté');
            process.exit(0);
          }
          console.error('❌', result.error);
          process.exit(1);
        } catch (err) {
          console.error('❌', err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('follow')
      .argument('<user>', 'the current user')
      .argument('<user_to_follow>', 'the user to follow')
      .action(async (user, user_to_follow) => {
        const followUserCommand: FollowUserCommand = {
          user,
          userToFollow: user_to_follow
        };
        try {
          await followUserUseCase.handle(followUserCommand);
          console.log(`✅ Utilisateur suivi: ${user_to_follow}`);
          process.exit(0);
        } catch (err) {
          console.error('❌', err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('wall').argument('<user>', 'the user to view the wall of').action(async (user) => {
      try {
        await viewUserWallUseCase.handle({ user }, timelinePresenter);

        process.exit(0);
      } catch (err) {
        console.error('❌', err);
        process.exit(1);
      }
    })
  )
  .addCommand(
    new Command('edit')
      .argument('<message_id>', 'the message id to edit')
      .argument('<message>', 'the new text')
      .action(async (message_id, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId: message_id,
          text: message
        };
        try {
          const result = await editMessageUseCase.handle(editMessageCommand);
          if (result.isOk()) {
            console.log('✅ Message edité');
            process.exit(0);
          }
          console.error('❌', result.error);
          process.exit(1);
        } catch (err) {
          console.error('❌', err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('view').argument('<user>', 'the user to view the timeline of').action(async (user) => {
      try {
        await viewTimelineUseCase.handle({ user }, timelinePresenter);
        process.exit(0);
      } catch (error) {
        console.error('❌', error);
        process.exit(1);
      }
    })
  );

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
