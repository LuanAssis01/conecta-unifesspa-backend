import { FastifyInstance } from "fastify";
import { projectController } from "../controller/projectController";
import multer from "fastify-multer";

const upload = multer({ dest: "uploads/" });

export async function projectRoutes(app: FastifyInstance) {
  app.post("/projects", { preHandler: upload.single("image") }, projectController.create);
  app.get("/projects", projectController.getAll);
  app.get("/projects/:id", projectController.getById);
  app.put("/projects/:id", { preHandler: upload.single("image") }, projectController.update);
  app.delete("/projects/:id", projectController.delete);
}

