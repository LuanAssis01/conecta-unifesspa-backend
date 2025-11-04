import { FastifyRequest, FastifyReply } from 'fastify';
import { keywordsService } from '../services/keywordsService';
import { ResponseHandler } from '../utils/responseHandler';

export const keywordsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };
            const { keywords } = request.body as { keywords: string[] };
            const { id: userId, role: userRole } = (request as any).user;

            const createdKeywords = await keywordsService.create({
                projectId,
                keywords,
                userId,
                userRole,
            });

            return ResponseHandler.created(reply, 'Palavras-chave associadas ao projeto com sucesso', { keywords: createdKeywords });
        } catch (error: any) {
            console.error(error);
            
            if (error.message === 'Palavras-chave são obrigatórias') {
                return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
            }
            
            if (error.message === 'Projeto não encontrado') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            if (error.message === 'Acesso negado') {
                return ResponseHandler.forbidden(reply, 'Acesso negado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao criar palavra-chave', error.message);
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const keywords = await keywordsService.getAll();
            return ResponseHandler.ok(reply, 'Palavras-chave recuperadas com sucesso', { keywords });
        } catch (error: any) {
            console.error(error);
            return ResponseHandler.internalError(reply, 'Erro ao buscar palavras-chave', error.message);
        }
    },

    async removeFromProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId, keywordId } = request.params as { projectId: string; keywordId: string };

            await keywordsService.removeFromProject(projectId, keywordId);

            return ResponseHandler.ok(reply, 'Palavra-chave removida do projeto com sucesso');
        } catch (error: any) {
            console.error(error);
            return ResponseHandler.internalError(reply, 'Erro ao remover palavra-chave', error.message);
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };

            const keywords = await keywordsService.getByProject(projectId);

            return ResponseHandler.ok(reply, 'Palavras-chave do projeto recuperadas com sucesso', { keywords });
        } catch (error: any) {
            console.error(error);
            return ResponseHandler.internalError(reply, 'Erro ao buscar palavras-chave do projeto', error.message);
        }
    },

    async getProjects(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { keywordId } = request.params as { keywordId: string };

            const projects = await keywordsService.getProjects(keywordId);

            return ResponseHandler.ok(reply, 'Projetos recuperados com sucesso', { projects });
        } catch (error: any) {
            console.error(error);
            
            if (error.message === 'Palavra-chave não encontrada') {
                return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
            }
            
            return ResponseHandler.internalError(reply, 'Erro ao buscar projetos da palavra-chave', error.message);
        }
    }
};
