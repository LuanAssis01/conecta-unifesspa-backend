import { FastifyInstance } from 'fastify';
import { userController } from '../controller/userController';
import { isAuthenticated } from "../middleware/isAuthenticated";

export function userRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };

  app.post("/user", userController.create);
  app.post("/login", userController.login);
  app.put("/profile", authenticatedHook, userController.update);
}
