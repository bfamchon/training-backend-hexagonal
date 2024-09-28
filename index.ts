#!/usr/bin/env node

import { Command } from 'commander';
import { EditMessageCommand, EditMessageUseCase } from './src/application/usecases/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from './src/application/usecases/follow-user.usecase';
import { PostMessageCommand, PostMessageUseCase } from './src/application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from './src/application/usecases/view-timeline.usecase';
import { ViewUserWallUseCase } from './src/application/usecases/view-wall.usecase';
import { FileSystemFollowedRepository } from './src/infrastructure/followed.fs.repository';
import { FileSystemMessageRepository } from './src/infrastructure/message.fs.repository';
import { RealDateProvider } from './src/infrastructure/real-date-provider';

const messageRepository = new FileSystemMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const followedRepository = new FileSystemFollowedRepository();
const followUserUseCase = new FollowUserUseCase(followedRepository);
const viewUserWallUseCase = new ViewUserWallUseCase(messageRepository, followedRepository, dateProvider);

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
          await postMessageUseCase.handle(postMessageCommand);
          console.log('✅ Message posté');
          process.exit(0);
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
        const wall = await viewUserWallUseCase.handle({ user });
        console.table(wall);
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
          await editMessageUseCase.handle(editMessageCommand);
          console.log('✅ Message edité');
          process.exit(0);
        } catch (err) {
          console.error('❌', err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('view').argument('<user>', 'the user to view the timeline of').action(async (user) => {
      try {
        const timeline = await viewTimelineUseCase.handle({ user });
        console.table(timeline);
        process.exit(0);
      } catch (error) {
        console.error('❌', error);
        process.exit(1);
      }
    })
  );

async function main() {
  await program.parseAsync();
}

main();
