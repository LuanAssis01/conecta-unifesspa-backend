import { FastifyInstance } from "fastify";
import { projectController } from "../controller/projectController";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { isAdmin } from "../middleware/adminOnly";

export async function projectRoutes(app: FastifyInstance) {
  const authenticatedHook = { preHandler: [isAuthenticated] };
  const adminHook = { preHandler: [isAdmin] };

  app.post("/projects", authenticatedHook, projectController.create);
  app.get("/projects", adminHook, projectController.getAll);
  app.get("/projects/:id", projectController.getById);
  app.put("/projects/:id", authenticatedHook, projectController.update);
  app.delete("/projects/:id", authenticatedHook, projectController.delete);
  app.post(
    "/projects/:id/proposal",
    authenticatedHook,
    projectController.updateProposal
  );
  app.post(
    "/projects/:id/image",
    authenticatedHook,
    projectController.updateImage
  );
  app.patch("/projects/:id/status", adminHook, projectController.updateStatus);
}
