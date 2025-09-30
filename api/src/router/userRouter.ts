import { FastifyInstance } from 'fastify';
import { userController } from '../controller/userController.ts';

export function userRoutes(app: FastifyInstance) {
  app.post("/user", userController.create);
}
