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
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTimelinePresenter } from 'apps/api/src/timeline.api.presenter';
import { FastifyReply } from 'fastify';

@Controller()
export class ApiController {
  constructor(
    private readonly postMessageUseCase: PostMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly viewUserWallUseCase: ViewUserWallUseCase,
  ) {}

  @Post('/post')
  async postMessage(@Body() body: { user: string; message: string }) {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 100000)}`,
      author: body.user,
      text: body.message,
    };
    try {
      await this.postMessageUseCase.handle(postMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('/edit')
  async editMessage(@Body() body: { messageId: string; text: string }) {
    const editMessageCommand: EditMessageCommand = {
      messageId: body.messageId,
      text: body.text,
    };
    try {
      await this.editMessageUseCase.handle(editMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('/follow')
  async followUser(@Body() body: { user: string; userToFollow: string }) {
    const followUserCommand: FollowUserCommand = {
      user: body.user,
      userToFollow: body.userToFollow,
    };
    try {
      await this.followUserUseCase.handle(followUserCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('/view')
  async viewTimeline(
    @Query() query: { user: string },
    @Res() response: FastifyReply,
  ) {
    try {
      const timelinePresenter = new ApiTimelinePresenter(response);
      await this.viewTimelineUseCase.handle(
        { user: query.user },
        timelinePresenter,
      );
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('/wall')
  async viewWall(
    @Query() query: { user: string },
    @Res() response: FastifyReply,
  ) {
    try {
      const wallPresenter = new ApiTimelinePresenter(response);
      await this.viewUserWallUseCase.handle(
        { user: query.user },
        wallPresenter,
      );
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
