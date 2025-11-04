import { FastifyInstance } from "fastify";
import { indicatorsController } from "../controller/indicatorsController";
import { isAuthenticated } from "../middleware/isAuthenticated";

export async function indicatorsRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };

  app.post(
    "/projects/:projectId/impact-indicators",
    authenticatedHook,
    indicatorsController.create
  );
  app.put(
    "/projects/:projectId/impact-indicators/:indicatorId",
    authenticatedHook,
    indicatorsController.update
  );
  app.delete(
    "/projects/:projectId/impact-indicators/:indicatorId",
    authenticatedHook,
    indicatorsController.delete
  );
  app.get(
    "/projects/:projectId/impact-indicators",
    indicatorsController.getByProject
  );
}
