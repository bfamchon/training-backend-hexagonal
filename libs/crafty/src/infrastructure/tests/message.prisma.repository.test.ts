import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaMessageRepository } from '../message.prisma.repository';
import { messageBuilder } from './../../tests/message.builder';

const asyncExec = promisify(exec);

describe('PrismaMessageRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('hexa_backend_test_db')
      .withUsername('hexa_user_test')
      .withPassword('hexa_password_test')
      .withExposedPorts(5432)
      .start();

    const dbUrl = container.getConnectionUri();
    prismaClient = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      }
    });

    await asyncExec(`DATABASE_URL=${dbUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });
  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test('save() should save a new message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withId('message-id')
        .authoredBy('Alice')
        .withText('Hello world')
        .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
        .build()
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'message-id'
      }
    });

    expect(expectedMessage).toEqual({
      id: 'message-id',
      authorId: 'Alice',
      text: 'Hello world',
      publishedAt: new Date('2024-09-29T10:00:00.000Z')
    });
  });

  test('save() should update an existing message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const aliceMessageBuilder = messageBuilder()
      .withId('message-id')
      .authoredBy('Alice')
      .withText('Hello world')
      .publishedAt(new Date('2024-09-29T10:00:00.000Z'));

    await messageRepository.save(aliceMessageBuilder.build());
    await messageRepository.save(aliceMessageBuilder.withText('Hello world edited').build());

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'message-id'
      }
    });

    expect(expectedMessage).toEqual({
      id: 'message-id',
      authorId: 'Alice',
      text: 'Hello world edited',
      publishedAt: new Date('2024-09-29T10:00:00.000Z')
    });
  });

  test('getById() should return an existing message by its id', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const aliceMessageBuilder = messageBuilder()
      .withId('message-id')
      .authoredBy('Alice')
      .withText('Hello world')
      .publishedAt(new Date('2024-09-29T10:00:00.000Z'));

    await messageRepository.save(aliceMessageBuilder.build());

    const expectedMessage = await messageRepository.getMessageById('message-id');

    expect(expectedMessage).toEqual(
      messageBuilder()
        .withId('message-id')
        .authoredBy('Alice')
        .withText('Hello world')
        .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
        .build()
    );
  });

  test('getAllOfUser() should return all message from a user', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await Promise.all([
      messageRepository.save(
        messageBuilder()
          .withId('message-1')
          .authoredBy('Alice')
          .withText('Hello world')
          .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
          .build()
      ),
      messageRepository.save(
        messageBuilder()
          .withId('message-2')
          .authoredBy('Bob')
          .withText('Bob message')
          .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
          .build()
      ),
      messageRepository.save(
        messageBuilder()
          .withId('message-3')
          .authoredBy('Alice')
          .withText('2nd from Alice')
          .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
          .build()
      )
    ]);

    const expectedMessage = await messageRepository.getAllOfUser('Alice');

    expect(expectedMessage).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId('message-1')
          .authoredBy('Alice')
          .withText('Hello world')
          .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
          .build(),
        messageBuilder()
          .withId('message-3')
          .authoredBy('Alice')
          .withText('2nd from Alice')
          .publishedAt(new Date('2024-09-29T10:00:00.000Z'))
          .build()
      ])
    );
  });
});
