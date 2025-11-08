import { FastifyInstance } from "fastify";
import { impactIndicatorsController } from "../controller/impactIndicatorsController";
import { isAuthenticated } from "../middleware/isAuthenticated";

export async function impactIndicatorsRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };

  app.post(
    "/projects/:projectId/impact-indicators",
    authenticatedHook,
    impactIndicatorsController.create
  );
  app.put(
    "/projects/:projectId/impact-indicators/:indicatorId",
    authenticatedHook,
    impactIndicatorsController.update
  );
  app.delete(
    "/projects/:projectId/impact-indicators/:indicatorId",
    authenticatedHook,
    impactIndicatorsController.delete
  );
  app.get(
    "/projects/:projectId/impact-indicators",
    impactIndicatorsController.getByProject
  );
}
