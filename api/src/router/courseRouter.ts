import { FastifyInstance } from "fastify";
import { courseController } from "../controller/courseController";
import { isAuthenticated } from "../middleware/isAuthenticated";

export async function courseRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };

  app.post("/courses", authenticatedHook, courseController.create);
  app.get("/courses", courseController.getAll);
  app.get("/courses/:id", courseController.getById);
  app.delete("/courses/:id", authenticatedHook, courseController.delete);
}
