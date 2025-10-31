import { FastifyInstance } from "fastify";
import { courseController } from "../controller/courseController";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { isAdmin } from "../middleware/adminOnly";

export async function courseRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };
  const adminHook = { preHandler: [isAdmin] };

  app.post("/courses", adminHook, courseController.create);
  app.get("/courses", courseController.getAll);
  app.get("/courses/:id", courseController.getById);
  app.delete("/courses/:id", authenticatedHook, courseController.delete);
}
