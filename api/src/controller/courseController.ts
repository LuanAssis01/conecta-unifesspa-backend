import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
    courseService,
    CourseNotFoundError,
    CourseAlreadyExistsError,
} from "../services/courseService";
import {
    CreateCourseSchema,
    CourseIdParamSchema,
} from "../valueObjects/courseValueObjects";

const formatZodError = (error: ZodError): string => {
    return error.issues.map((issue) => issue.message).join(", ");
};

export const courseController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = CreateCourseSchema.parse(request.body);

            const course = await courseService.create(data);

            return reply.status(201).send({
                message: "Curso criado com sucesso",
                course,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof CourseAlreadyExistsError) {
                return reply.status(409).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao criar curso" });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const courses = await courseService.getAll();
            return reply.status(200).send(courses);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar cursos" });
        }
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = CourseIdParamSchema.parse(request.params);

            const course = await courseService.getById(id);

            return reply.status(200).send(course);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof CourseNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar curso" });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = CourseIdParamSchema.parse(request.params);

            await courseService.delete(id);

            return reply.status(200).send({ message: "Curso deletado com sucesso" });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof CourseNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao deletar curso" });
        }
    },
};
