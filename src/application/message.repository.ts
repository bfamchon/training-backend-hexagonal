import { Message } from '../domain/message';

export interface MessageRepository {
  save(message: Message): Promise<void>;
  getAllOfUser(user: string): Promise<Message[]>;
  getMessageById(messageId: string): Promise<Message>;
}
