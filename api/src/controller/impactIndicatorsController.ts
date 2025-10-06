import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const impactIndicatorsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { title, value, projectId } = request.body as {
                title: string;
                value: number;
                projectId?: number;
            };

            const indicator = await prisma.impactIndicators.create({
                data: { title, value, projectId },
            });

            return reply.status(201).send({ message: 'Indicador criado com sucesso', indicator });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao criar indicador de impacto' });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const indicators = await prisma.impactIndicators.findMany({ include: { project: true } });
            return reply.status(200).send(indicators);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao buscar indicadores' });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };

            await prisma.impactIndicators.delete({ where: { id: Number(id) } });
            return reply.status(200).send({ message: 'Indicador deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao deletar indicador' });
        }
    },
};
