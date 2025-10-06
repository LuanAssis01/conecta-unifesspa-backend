import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const keywordsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { name, projectid } = request.body as { name: string; projectid?: number };

            const keyword = await prisma.keywords.create({
                data: { name, projectid },
            });

            return reply.status(201).send({ message: 'Palavra-chave criada com sucesso', keyword });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao criar palavra-chave' });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const keywords = await prisma.keywords.findMany({ include: { project: true } });
            return reply.status(200).send(keywords);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao buscar palavras-chave' });
        }
    },
};
