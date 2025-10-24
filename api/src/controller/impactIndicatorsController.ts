import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const impactIndicatorsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };
            const { indicators } = request.body as {
                indicators: Array<{ title: string; value: number }>;
            };

            if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
                return reply.status(400).send({ error: "Envie pelo menos um indicador" });
            }

            const createdIndicators = await Promise.all(
                indicators.map(ind =>
                    prisma.impactIndicator.create({
                        data: {
                            id: crypto.randomUUID(),
                            title: ind.title,
                            value: ind.value,
                            projectId,
                        },
                    })
                )
            );

            return reply.status(201).send({
                message: "Indicadores criados com sucesso",
                indicators: createdIndicators,
            });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao criar indicadores" });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const indicators = await prisma.impactIndicator.findMany({ include: { project: true } });
            return reply.status(200).send(indicators);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao buscar indicadores' });
        }
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = request.params as { indicatorId: string };
            const { title, value } = request.body as { title?: string; value?: number };

            const indicator = await prisma.impactIndicator.update({
                where: { id: indicatorId },
                data: {
                    title,
                    value,
                },
            });

            return reply.status(200).send({
                message: "Indicador de impacto atualizado com sucesso",
                indicator,
            });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao atualizar indicador de impacto" });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = request.params as { indicatorId: string };

            await prisma.impactIndicator.delete({
                where: { id: indicatorId },
            });

            return reply.status(200).send({ message: "Indicador de impacto deletado com sucesso" });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao deletar indicador de impacto" });
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = request.params as { projectId: string };

            const indicators = await prisma.impactIndicator.findMany({
                where: { projectId },
            });

            return reply.status(200).send(indicators);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar indicadores do projeto" });
        }
    },
};
