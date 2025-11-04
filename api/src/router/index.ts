import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRouter';
import { projectRoutes } from './projectRouter';
import { courseRoutes } from './courseRouter';
import { indicatorsRoutes } from './indicatorsRouter';
import { keywordsRoutes } from './keywordsRouter';
import { chatWithAgent } from '../controller/aiController';

export async function appRoutes(app: FastifyInstance) {
  app.register(userRoutes);
  app.register(projectRoutes);
  app.register(courseRoutes);
  app.register(indicatorsRoutes);
  app.register(keywordsRoutes);
  app.post('/ai/chat', chatWithAgent);
}

