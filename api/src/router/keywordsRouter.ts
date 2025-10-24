import { FastifyInstance } from 'fastify';
import { keywordsController } from '../controller/keywordsController';

export async function keywordsRoutes(app: FastifyInstance) {
    app.post('/keywords/projects/:projectId', keywordsController.create);
    app.get('/keywords/projects/:projectId', keywordsController.getByProject);
    app.delete('/keywords/:keywordId/projects/:projectId', keywordsController.removeFromProject)
    app.get("/keywords/:keywordId/projects", keywordsController.getProjects);
    app.get('/keywords', keywordsController.getAll);
}