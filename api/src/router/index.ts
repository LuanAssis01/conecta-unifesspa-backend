import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRouter';
import { projectRoutes } from './projectRouter';
import { courseRoutes } from './courseRouter';
import { impactIndicatorsRoutes } from './impactIndicatorsRouter';

export async function appRoutes(app: FastifyInstance) {
  app.register(userRoutes);
  app.register(projectRoutes);
  app.register(courseRoutes);
  app.register(impactIndicatorsRoutes);
}

