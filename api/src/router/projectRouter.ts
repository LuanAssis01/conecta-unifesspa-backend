import { FastifyInstance } from "fastify";
import { projectController } from "../controller/projectController";

export async function projectRoutes(app: FastifyInstance) {
  app.post("/projects", projectController.create);
  app.get("/projects", projectController.getAll);
  app.get("/projects/:id", projectController.getById);
  app.put("/projects/:id", projectController.update);
  app.delete("/projects/:id", projectController.delete);
  app.post('/projects/:id/proposal', projectController.updateProposal);
  app.post('/projects/:id/image', projectController.updateImage);
  app.patch("/projects/:id/status", projectController.updateStatus);
}