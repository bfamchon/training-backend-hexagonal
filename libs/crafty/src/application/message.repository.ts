import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message';

@Injectable()
export abstract class MessageRepository {
  abstract save(message: Message): Promise<void>;
  abstract getAllOfUser(user: string): Promise<Message[]>;
  abstract getMessageById(messageId: string): Promise<Message>;
}
