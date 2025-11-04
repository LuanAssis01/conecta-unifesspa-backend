import { FastifyRequest, FastifyReply } from 'fastify';
import { indicatorsService } from '../services/indicatorsService';
import { ResponseHandler } from '../utils/responseHandler';

export const indicatorsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };
            const { indicators } = request.body as {
                indicators: Array<{ title: string; value: number }>;
            };
            const { id: userId, role: userRole } = (request as any).user;

            const createdIndicators = await indicatorsService.create({
                projectId,
                indicators,
                userId,
                userRole,
            });

            return ResponseHandler.created(reply, 'Indicadores criados com sucesso', { indicators: createdIndicators });
        } catch (error: any) {
            console.error(error);
            
            if (error.message === 'Indicadores são obrigatórios') {
                return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
            }
            
            if (error.message === 'Projeto não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            if (error.message === 'Acesso negado') {
                return ResponseHandler.forbidden(reply, 'Acesso negado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao criar indicadores', error.message);
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const indicators = await indicatorsService.getAll();
            return ResponseHandler.ok(reply, 'Indicadores recuperados com sucesso', { indicators });
        } catch (error: any) {
            console.error(error);
            return ResponseHandler.internalError(reply, 'Erro ao buscar indicadores', error.message);
        }
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = request.params as { indicatorId: string };
            const { title, value } = request.body as { title?: string; value?: number };
            const { id: userId, role: userRole } = (request as any).user;

            const indicator = await indicatorsService.update({
                indicatorId,
                title,
                value,
                userId,
                userRole,
            });

            return ResponseHandler.ok(reply, 'Indicador atualizado com sucesso', { indicator });
        } catch (error: any) {
            console.error(error);
            
            if (error.message === 'Indicador não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            if (error.message === 'Indicador não associado a um projeto válido') {
                return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
            }
            
            if (error.message === 'Acesso negado') {
                return ResponseHandler.forbidden(reply, 'Acesso negado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao atualizar indicador', error.message);
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = request.params as { indicatorId: string };
            const { id: userId, role: userRole } = (request as any).user;

            await indicatorsService.delete(indicatorId, userId, userRole);

            return ResponseHandler.ok(reply, 'Indicador deletado com sucesso');
        } catch (error: any) {
            console.error(error);
            
            if (error.message === 'Indicador não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            if (error.message === 'Indicador não associado a um projeto válido') {
                return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
            }
            
            if (error.message === 'Acesso negado') {
                return ResponseHandler.forbidden(reply, 'Acesso negado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao deletar indicador', error.message);
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };

            const indicators = await indicatorsService.getByProject(projectId);

            return ResponseHandler.ok(reply, 'Indicadores do projeto recuperados com sucesso', { indicators });
        } catch (error: any) {
            console.error(error);
            return ResponseHandler.internalError(reply, 'Erro ao buscar indicadores do projeto', error.message);
        }
    },
};
