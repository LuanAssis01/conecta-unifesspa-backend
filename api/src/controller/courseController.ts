import { FastifyRequest, FastifyReply } from 'fastify';
import { courseService } from '../services/courseService';
import { ResponseHandler } from '../utils/responseHandler';

export const courseController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { name } = request.body as { name: string };

            const course = await courseService.create({ name });
            
            return ResponseHandler.created(reply, 'Curso criado com sucesso', { course });
        } catch (error: any) {
            
            if (error.message === 'Nome é obrigatório') {
                return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
            }
            
            if (error.message === 'Curso já cadastrado') {
                return ResponseHandler.conflict(reply, 'Recurso já existe', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao criar curso', error.message);
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const courses = await courseService.getAll();
            return ResponseHandler.ok(reply, 'Cursos recuperados com sucesso', { courses });
        } catch (error: any) {
            return ResponseHandler.internalError(reply, 'Erro ao buscar cursos', error.message);
        }
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };

            const course = await courseService.getById(id);
            
            return ResponseHandler.ok(reply, 'Curso recuperado com sucesso', { course });
        } catch (error: any) {            
            if (error.message === 'Curso não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao buscar curso', error.message);
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };

            await courseService.delete(id);
            
            return ResponseHandler.ok(reply, 'Curso deletado com sucesso');
        } catch (error: any) {
            
            if (error.message === 'Curso não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao deletar curso', error.message);
        }
    },
};
