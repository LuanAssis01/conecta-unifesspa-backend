import { FastifyInstance } from 'fastify';
import { keywordsController } from '../controller/keywordsController';

export async function keywordsRoutes(app: FastifyInstance) {
    app.post('/keywords', keywordsController.create);
    app.get('/keywords', keywordsController.getAll);
}
