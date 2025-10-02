import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRouter.ts';

export async function appRoutes(app: FastifyInstance) {
  app.register(userRoutes);
}

