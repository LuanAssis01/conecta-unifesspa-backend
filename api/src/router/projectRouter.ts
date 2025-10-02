import { FastifyInstance } from "fastify";
import { projectController } from "../controller/projectController";
import { upload } from "../middlewares/upload";

export async function projectRoutes(app: FastifyInstance) {
  app.post(
    "/projects",
    { preHandler: upload.single("image") }, // campo "image" no form-data
    projectController.create
  );
}

