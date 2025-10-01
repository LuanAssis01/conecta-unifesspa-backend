import { FastifyInstance } from 'fastify';
import { userController } from '../controller/userController';

export function userRoutes(app: FastifyInstance) {
  app.post("/user", userController.create);
}
