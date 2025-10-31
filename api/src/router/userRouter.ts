import { FastifyInstance } from 'fastify';
import { userController } from '../controller/userController';
import { isAuthenticated } from "../middleware/isAuthenticated";
import { isAdmin } from "../middleware/adminOnly";

export function userRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };
  const adminHook = { preHandler: [isAdmin] };

  app.post("/user", adminHook, userController.create);
  app.post("/login", userController.login);
  app.put("/profile", authenticatedHook, userController.update);
}
