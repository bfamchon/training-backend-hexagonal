import { MessageText } from './message';
import { MessageRepository } from './message.repository';

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}
  async handle(editMessageCommand: EditMessageCommand) {
    const messageText = MessageText.of(editMessageCommand.text);

    const message = await this.messageRepository.getMessageById(editMessageCommand.messageId);

    await this.messageRepository.save({
      ...message,
      text: messageText
    });
  }
}
