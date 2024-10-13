import { FastifyReply } from 'fastify';
import { TimelinePresenter } from '../../../libs/crafty/src/application/timeline.presenter';
import { Timeline } from '../../../libs/crafty/src/domain/timeline';

export class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}
  show(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}
