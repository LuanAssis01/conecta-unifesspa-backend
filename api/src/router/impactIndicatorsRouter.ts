import { FastifyInstance } from 'fastify';
import { impactIndicatorsController } from '../controller/impactIndicatorsController';

export async function impactIndicatorsRoutes(app: FastifyInstance) {
    app.post('/indicators', impactIndicatorsController.create);
    app.get('/indicators', impactIndicatorsController.getAll);
    app.delete('/indicators/:id', impactIndicatorsController.delete);
}
