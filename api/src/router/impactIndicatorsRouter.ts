import { FastifyInstance } from 'fastify';
import { impactIndicatorsController } from '../controller/impactIndicatorsController';

export async function impactIndicatorsRoutes(app: FastifyInstance) {
    app.post('/projects/:projectId/impact-indicators', impactIndicatorsController.create);
    app.put('/projects/:projectId/impact-indicators/:indicatorId', impactIndicatorsController.update);
    app.delete('/projects/:projectId/impact-indicators/:indicatorId', impactIndicatorsController.delete);
    app.get('/projects/:projectId/impact-indicators', impactIndicatorsController.getByProject);
}