import { DateProvider } from '@crafty/crafty/application/date.provider';
import { PrismaFollowedRepository } from '@crafty/crafty/infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/message.prisma.repository';
import { StubDateProvider } from '@crafty/crafty/infrastructure/stub-date-provider';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import * as request from 'supertest';
import { promisify } from 'util';
import { ApiModule } from '../src/api.module';

const asyncExec = promisify(exec);

describe('Api App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let app: INestApplication;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('post command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await request(app.getHttpServer())
      .post('/post')
      .send({
        user: 'Alice',
        message: 'Message from test',
      })
      .expect(201);

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

    await messageRepository.save(
      messageBuilder()
        .withId('msg-1')
        .withText('Message Test View command')
        .authoredBy('Alice')
        .publishedAt(now)
        .build(),
    );

    const { body } = await request(app.getHttpServer())
      .get('/view')
      .query({
        user: 'Alice',
      })
      .expect(200);

    expect(body).toEqual(
      expect.arrayContaining([
        {
          id: 'msg-1',
          author: 'Alice',
          text: 'Message Test View command',
          publishedAt: now.toISOString(),
        },
      ]),
    );
  });

  test('wall command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const followedRepository = new PrismaFollowedRepository(prismaClient);

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

    const { body } = await request(app.getHttpServer())
      .get('/wall')
      .query({
        user: 'Alice',
      })
      .expect(200);

    expect(body).toEqual(
      expect.arrayContaining([
        {
          id: 'msg-1',
          author: 'Alice',
          text: 'Message Test View command',
          publishedAt: now.toISOString(),
        },
        {
          id: 'msg-2',
          author: 'Jean',
          text: 'Message Test View command 2',
          publishedAt: now.toISOString(),
        },
      ]),
    );
  });

  test('follow command', async () => {
    const followedRepository = new PrismaFollowedRepository(prismaClient);

    await Promise.all([
      followedRepository.followUser({
        user: 'Alice',
        userToFollow: 'Jean',
      }),
    ]);

    await request(app.getHttpServer())
      .post('/follow')
      .send({
        user: 'Alice',
        userToFollow: 'Jean',
      })
      .expect(201);

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

    await request(app.getHttpServer())
      .post('/edit')
      .send({
        messageId: 'msg-1',
        text: 'Message edited',
      })
      .expect(201);

    const aliceMessages = await messageRepository.getAllOfUser('Alice');

    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message edited',
      publishedAt: now,
    });
  });
});
