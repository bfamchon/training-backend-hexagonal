import * as fs from 'fs';
import * as path from 'path';
import { FileSystemMessageRepository } from '../message.fs.repository';
import { messageBuilder } from './message.builder';

const testMessagePath = path.join(__dirname, './messages.test.json');

describe('FileSystemMessageRepository', () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
  });

  test('save() can save a message in the filesystem', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    const aliceMessageBuilder = messageBuilder()
      .authoredBy('Alice')
      .withId('m1')
      .publishedAt(new Date('2024-09-28T16:00:00.000Z'))
      .withText('Test message');
    await messageRepository.save(aliceMessageBuilder.build());

    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJson = JSON.parse(messagesData.toString());

    expect(messagesJson).toEqual([
      {
        id: 'm1',
        author: 'Alice',
        publishedAt: '2024-09-28T16:00:00.000Z',
        text: 'Test message'
      }
    ]);
  });

  test('save() can update a message in the filesystem', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    const aliceMessageBuilder = messageBuilder()
      .authoredBy('Alice')
      .withId('m1')
      .publishedAt(new Date('2024-09-28T16:00:00.000Z'))
      .withText('Edited');
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          publishedAt: '2024-09-28T16:00:00.000Z',
          text: 'Test message'
        }
      ])
    );

    await messageRepository.save(aliceMessageBuilder.build());

    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJson = JSON.parse(messagesData.toString());

    expect(messagesJson).toEqual([
      {
        id: 'm1',
        author: 'Alice',
        publishedAt: '2024-09-28T16:00:00.000Z',
        text: 'Edited'
      }
    ]);
  });
  test('getById() returns a message by its id', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          publishedAt: '2024-09-28T16:00:00.000Z',
          text: 'Test message'
        },
        {
          id: 'm2',
          author: 'Bob',
          publishedAt: '2024-09-28T17:00:00.000Z',
          text: 'Bob message'
        }
      ])
    );
    const bobMessage = await messageRepository.getMessageById('m2');

    expect(bobMessage).toEqual(
      messageBuilder()
        .authoredBy('Bob')
        .withId('m2')
        .publishedAt(new Date('2024-09-28T17:00:00.000Z'))
        .withText('Bob message')
        .build()
    );
  });

  test('getAllOfUser() returns all message from a user', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          publishedAt: '2024-09-28T16:00:00.000Z',
          text: 'Test message'
        },
        {
          id: 'm3',
          author: 'Alice',
          publishedAt: '2024-09-28T16:00:00.000Z',
          text: '2nd message'
        },
        {
          id: 'm2',
          author: 'Bob',
          publishedAt: '2024-09-28T17:00:00.000Z',
          text: 'Bob message'
        }
      ])
    );
    const aliceMessages = await messageRepository.getAllOfUser('Alice');

    expect(aliceMessages).toHaveLength(2);
    expect(aliceMessages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .authoredBy('Alice')
          .withId('m1')
          .publishedAt(new Date('2024-09-28T16:00:00.000Z'))
          .withText('Test message')
          .build(),
        messageBuilder()
          .authoredBy('Alice')
          .withId('m3')
          .publishedAt(new Date('2024-09-28T16:00:00.000Z'))
          .withText('2nd message')
          .build()
      ])
    );
  });
});
