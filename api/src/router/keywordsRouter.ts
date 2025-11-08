import { FastifyInstance } from "fastify";
import { keywordsController } from "../controller/keywordsController";
import { isAuthenticated } from "../middleware/isAuthenticated";

export async function keywordsRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };

  app.post(
    "/keywords/projects/:projectId",
    authenticatedHook,
    keywordsController.create
  );
  app.get("/keywords/projects/:projectId", keywordsController.getByProject);
  app.delete(
    "/keywords/:keywordId/projects/:projectId",
    authenticatedHook,
    keywordsController.removeFromProject
  );
  app.get("/keywords/:keywordId/projects", keywordsController.getProjects);
  app.get("/keywords", authenticatedHook, keywordsController.getAll);
}
