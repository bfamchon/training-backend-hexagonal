import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/edit-message.usecase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/follow-user.usecase';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/view-timeline.usecase';
import { ViewUserWallUseCase } from '@crafty/crafty/application/usecases/view-wall.usecase';
import { Command, CommandRunner } from 'nest-commander';
import { CliTimelinePresenter } from './timeline.cli.presenter';

@Command({ name: 'post', arguments: '<user> <message>' })
export class PostCommand extends CommandRunner {
  constructor(private readonly postMessageUseCase: PostMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [user, message] = passedParams;
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 100000)}`,
      author: user,
      text: message,
    };
    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);
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
  }
}

@Command({ name: 'wall', arguments: '<user>' })
export class WallCommand extends CommandRunner {
  constructor(
    private readonly viewUserWallUseCase: ViewUserWallUseCase,
    private readonly cliPresenter: CliTimelinePresenter,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [user] = passedParams;

    try {
      await this.viewUserWallUseCase.handle({ user }, this.cliPresenter);

      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}
@Command({ name: 'view', arguments: '<user>' })
export class ViewCommand extends CommandRunner {
  constructor(
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly cliPresenter: CliTimelinePresenter,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [user] = passedParams;

    try {
      await this.viewTimelineUseCase.handle({ user }, this.cliPresenter);

      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'edit', arguments: '<message_id> <message>' })
export class EditCommand extends CommandRunner {
  constructor(private readonly editMessageUseCase: EditMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [message_id, message] = passedParams;
    const editMessageCommand: EditMessageCommand = {
      messageId: message_id,
      text: message,
    };
    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);
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
  }
}

@Command({ name: 'post', arguments: '<user> <user_to_follow>' })
export class FollowCommand extends CommandRunner {
  constructor(private readonly followUserUseCase: FollowUserUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [user, user_to_follow] = passedParams;
    const followUserCommand: FollowUserCommand = {
      user,
      userToFollow: user_to_follow,
    };
    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log(`✅ Utilisateur suivi: ${user_to_follow}`);
      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}
