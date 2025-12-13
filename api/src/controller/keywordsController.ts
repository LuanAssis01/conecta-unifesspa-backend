import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
    keywordsService,
    ProjectNotFoundError,
    KeywordNotFoundError,
    KeywordAccessDeniedError,
} from "../services/keywordsService";
import {
    CreateKeywordsSchema,
    ProjectIdParamSchema,
    KeywordIdParamSchema,
    ProjectKeywordParamsSchema,
} from "../valueObjects/keywordsValueObjects";

const formatZodError = (error: ZodError): string => {
    return error.issues.map((err: { message: any; }) => err.message).join(", ");
};

export const keywordsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = ProjectIdParamSchema.parse(request.params);
            const { keywords } = CreateKeywordsSchema.parse(request.body);

            const { id: userId, role: userRole } = request.user;

            const createdKeywords = await keywordsService.create(
                projectId,
                keywords,
                userId,
                userRole
            );

            return reply.status(201).send({
                message: "Palavras-chave associadas ao projeto com sucesso",
                keywords: createdKeywords,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof ProjectNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            if (error instanceof KeywordAccessDeniedError) {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao criar palavra-chave" });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const keywords = await keywordsService.getAll();
            return reply.status(200).send(keywords);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar palavras-chave" });
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = ProjectIdParamSchema.parse(request.params);

            const keywords = await keywordsService.getByProject(projectId);

            return reply.status(200).send(keywords);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar palavras-chave do projeto" });
        }
    },

    async getProjects(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { keywordId } = KeywordIdParamSchema.parse(request.params);

            const projects = await keywordsService.getProjectsByKeyword(keywordId);

            return reply.status(200).send(projects);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof KeywordNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar projetos da keyword" });
        }
    },

    async removeFromProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId, keywordId } = ProjectKeywordParamsSchema.parse(request.params);
            const { id: userId, role: userRole } = request.user;

            await keywordsService.removeFromProject(projectId, keywordId, userId, userRole);

            return reply.status(200).send({ message: "Palavra-chave removida do projeto com sucesso" });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof ProjectNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            if (error instanceof KeywordAccessDeniedError) {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao remover palavra-chave" });
        }
    },
};
