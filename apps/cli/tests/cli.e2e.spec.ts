import { DateProvider } from '@crafty/crafty/application/date.provider';
import { PrismaFollowedRepository } from '@crafty/crafty/infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/message.prisma.repository';
import { StubDateProvider } from '@crafty/crafty/infrastructure/stub-date-provider';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { CommandTestFactory } from 'nest-commander-testing';
import { promisify } from 'util';
import { CliModule } from '../src/cli.module';

const asyncExec = promisify(exec);

describe('Cli App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;
  const now = new Date('2024-10-13T19:00:00.000Z');
  const dateProvider = new StubDateProvider();
  dateProvider.now = now;

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
        db: { url: dbUrl },
      },
    });

    await asyncExec(`DATABASE_URL=${dbUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  beforeEach(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [CliModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('post command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await CommandTestFactory.run(commandInstance, [
      'post',
      'Alice',
      'Message from test',
    ]);

    const aliceMessages = await messageRepository.getAllOfUser('Alice');

    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from test',
      publishedAt: now,
    });
  });

  test('view command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable);

    await messageRepository.save(
      messageBuilder()
        .withText('Message Test View command')
        .authoredBy('Alice')
        .publishedAt(now)
        .build(),
    );

    await CommandTestFactory.run(commandInstance, ['view', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith([
      {
        author: 'Alice',
        text: 'Message Test View command',
        publicationTime: 'Less than a minute ago',
      },
    ]);
  });

  test('wall command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const followedRepository = new PrismaFollowedRepository(prismaClient);

    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable);

    await Promise.all([
      followedRepository.followUser({
        user: 'Alice',
        userToFollow: 'Jean',
      }),
      messageRepository.save(
        messageBuilder()
          .withId('msg-1')
          .withText('Message Test View command')
          .authoredBy('Alice')
          .publishedAt(now)
          .build(),
      ),
      messageRepository.save(
        messageBuilder()
          .withId('msg-2')
          .withText('Message Test View command 2')
          .authoredBy('Jean')
          .publishedAt(now)
          .build(),
      ),
    ]);

    await CommandTestFactory.run(commandInstance, ['wall', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith([
      {
        author: 'Alice',
        text: 'Message Test View command',
        publicationTime: 'Less than a minute ago',
      },
      {
        author: 'Jean',
        text: 'Message Test View command 2',
        publicationTime: 'Less than a minute ago',
      },
    ]);
  });

  test('follow command', async () => {
    const followedRepository = new PrismaFollowedRepository(prismaClient);

    await Promise.all([
      followedRepository.followUser({
        user: 'Alice',
        userToFollow: 'Jean',
      }),
    ]);

    await CommandTestFactory.run(commandInstance, ['follow', 'Alice', 'Jean']);

    const followed = await followedRepository.getFollowedOfUser('Alice');
    expect(followed).toEqual(expect.arrayContaining(['Jean']));
  });

  test('edit command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withId('msg-1')
        .withText('Message Test View command')
        .authoredBy('Alice')
        .publishedAt(now)
        .build(),
    );

    await CommandTestFactory.run(commandInstance, [
      'edit',
      'msg-1',
      'Message edited',
    ]);

    const aliceMessages = await messageRepository.getAllOfUser('Alice');

    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message edited',
      publishedAt: now,
    });
  });
});
