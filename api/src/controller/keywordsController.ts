import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const keywordsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };
            const { keywords } = request.body as { keywords: string[] };

            if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
                return reply.status(400).send({ error: "Keywords são obrigatórias" });
            }

            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) return reply.status(404).send({ error: "Projeto não encontrado" });

            const createdKeywords = [];

            for (const keywordName of keywords) {
                if (!keywordName || keywordName.trim() === "") continue;

                const keyword = await prisma.keyword.upsert({
                    where: { name: keywordName },
                    update: {
                        project: { connect: { id: projectId } },
                    },
                    create: {
                        name: keywordName,
                        project: { connect: { id: projectId } },
                    },
                });

                createdKeywords.push(keyword);
            }

            return reply.status(201).send({
                message: "Palavras-chave associadas ao projeto com sucesso",
                keywords: createdKeywords,
            });

        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao criar palavra-chave" });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const keywords = await prisma.keyword.findMany();
            return reply.status(200).send(keywords);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar palavras-chave" });
        }
    },

    async removeFromProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId, keywordId } = request.params as { projectId: string; keywordId: string };

            // Remove a associação (não deleta a keyword global)
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    keywords: {
                        disconnect: { id: keywordId },
                    },
                },
            });

            return reply.status(200).send({ message: "Palavra-chave removida do projeto com sucesso" });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao remover palavra-chave" });
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };

            const keywords = await prisma.keyword.findMany({
                where: { project: { some: { id: projectId } } },
            });

            return reply.status(200).send(keywords);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar palavras-chave do projeto" });
        }
    },

    async getProjects(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { keywordId } = request.params as { keywordId: string };

            const keyword = await prisma.keyword.findUnique({
                where: { id: keywordId },
                include: {
                    project: true, // pega todos os projetos associados
                },
            });

            if (!keyword) return reply.status(404).send({ error: "Keyword não encontrada" });

            return reply.status(200).send(keyword.project);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar projetos da keyword" });
        }
    }
};
