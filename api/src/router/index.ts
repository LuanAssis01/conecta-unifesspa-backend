import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRouter.ts';
import { projectRoutes } from './projectRouter';

export async function appRoutes(app: FastifyInstance) {
  app.register(userRoutes);
  app.register(projectRoutes);
}

