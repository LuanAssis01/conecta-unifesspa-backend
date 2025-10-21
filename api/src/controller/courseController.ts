import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export const courseController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { name } = request.body as { name: string };

            if (!name) {
                return reply.status(400).send({ error: 'Nome do curso é obrigatório' });
            }

            const existingCourse = await prisma.course.findFirst({ where: { name } });

            if (existingCourse) {
                return reply.status(409).send({ error: 'Já existe um curso com esse nome' });
            }

            const course = await prisma.course.create({ data: { name } });
            return reply.status(201).send({ message: 'Curso criado com sucesso', course });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao criar curso' });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const courses = await prisma.course.findMany();
            return reply.status(200).send(courses);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao buscar cursos' });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };

            const course = await prisma.course.findUnique({ where: { id } });
            if (!course) return reply.status(404).send({ error: 'Curso não encontrado' });

            await prisma.course.delete({ where: { id } });
            return reply.status(200).send({ message: 'Curso deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: 'Erro ao deletar curso' });
        }
    },
};
