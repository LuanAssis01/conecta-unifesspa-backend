import { FastifyInstance } from "fastify";
import { courseController } from "../controller/courseController";

export async function courseRoutes(app: FastifyInstance) {
    app.post('/courses', courseController.create);
    app.get('/courses', courseController.getAll);
    app.get('/courses/:id', courseController.getById);
    app.delete('/courses/:id', courseController.delete);
}