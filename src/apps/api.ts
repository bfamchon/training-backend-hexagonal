import { PrismaClient } from '@prisma/client';
import Fastify, { FastifyInstance } from 'fastify';
import * as httpErrors from 'http-errors';
import { EditMessageCommand, EditMessageUseCase } from '../application/usecases/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '../application/usecases/follow-user.usecase';
import { PostMessageCommand, PostMessageUseCase } from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { ViewUserWallUseCase } from '../application/usecases/view-wall.usecase';
import { PrismaFollowedRepository } from '../infrastructure/followed.prisma.repository';
import { PrismaMessageRepository } from '../infrastructure/message.prisma.repository';
import { RealDateProvider } from '../infrastructure/real-date-provider';

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const followedRepository = new PrismaFollowedRepository(prismaClient);
const followUserUseCase = new FollowUserUseCase(followedRepository);
const viewUserWallUseCase = new ViewUserWallUseCase(messageRepository, followedRepository, dateProvider);

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>('/post', {}, async (request, reply) => {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 100000)}`,
      author: request.body.user,
      text: request.body.message
    };
    try {
      await postMessageUseCase.handle(postMessageCommand);
      reply.status(201);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{ Body: { messageId: string; text: string } }>('/edit', {}, async (request, reply) => {
    const editMessageCommand: EditMessageCommand = {
      messageId: request.body.messageId,
      text: request.body.text
    };
    try {
      await editMessageUseCase.handle(editMessageCommand);
      reply.status(200);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{ Body: { user: string; userToFollow: string } }>(
    '/follow',
    {},
    async (request, reply) => {
      const followUserCommand: FollowUserCommand = {
        user: request.body.user,
        userToFollow: request.body.userToFollow
      };
      try {
        await followUserUseCase.handle(followUserCommand);
        reply.status(200);
      } catch (err) {
        reply.send(httpErrors[500](err));
      }
    }
  );

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply: { author: string; text: string; publicationTime: string }[] | httpErrors.httpErrors<500>;
  }>('/view', {}, async (request, reply) => {
    try {
      const timeline = await viewTimelineUseCase.handle({ user: request.query.user });
      reply.status(200).send(timeline);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply: { author: string; text: string; publicationTime: string }[] | httpErrors.httpErrors<500>;
  }>('/wall', {}, async (request, reply) => {
    try {
      const wall = await viewUserWallUseCase.handle({ user: request.query.user });
      reply.status(200).send(wall);
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });
};

fastify.register(routes);
fastify.addHook('onClose', async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

main();
