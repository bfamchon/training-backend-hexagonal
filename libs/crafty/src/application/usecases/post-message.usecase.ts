import { Injectable } from '@nestjs/common';
import {
  EmptyMessageError,
  Message,
  MessageTooLongError,
} from '../../domain/message';
import { DateProvider } from '../date.provider';
import { MessageRepository } from '../message.repository';
import { Err, Ok, Result } from '../result';

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

@Injectable()
export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle(
    postMessageCommand: PostMessageCommand,
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    let message: Message;
    try {
      message = Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow(),
      });
    } catch (error) {
      return Err.of(error);
    }
    await this.messageRepository.save(message);
    return Ok.of(undefined);
  }
}
