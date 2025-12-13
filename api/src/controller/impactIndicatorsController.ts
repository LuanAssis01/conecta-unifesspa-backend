import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
    impactService,
    ProjectNotFoundError,
    IndicatorNotFoundError,
    IndicatorNotAssociatedError,
    IndicatorAccessDeniedError,
} from "../services/impactService";
import {
    CreateIndicatorsSchema,
    UpdateIndicatorSchema,
    ProjectIdParamSchema,
    IndicatorIdParamSchema,
} from "../valueObjects/impactIndicatorsValueObjects";

const formatZodError = (error: ZodError): string => {
    return error.issues.map((err) => err.message).join(", ");
};

export const impactIndicatorsController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = ProjectIdParamSchema.parse(request.params);
            const { indicators } = CreateIndicatorsSchema.parse(request.body);

            const { id: userId, role: userRole } = request.user;

            const createdIndicators = await impactService.create(
                projectId,
                indicators,
                userId,
                userRole
            );

            return reply.status(201).send({
                message: "Indicadores criados com sucesso",
                indicators: createdIndicators,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof ProjectNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            if (error instanceof IndicatorAccessDeniedError) {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao criar indicadores" });
        }
    },

    async getAll(_: FastifyRequest, reply: FastifyReply) {
        try {
            const indicators = await impactService.getAll();
            return reply.status(200).send(indicators);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar indicadores" });
        }
    },

    async getByProject(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { projectId } = ProjectIdParamSchema.parse(request.params);

            const indicators = await impactService.getByProject(projectId);

            return reply.status(200).send(indicators);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao buscar indicadores do projeto" });
        }
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = IndicatorIdParamSchema.parse(request.params);
            const data = UpdateIndicatorSchema.parse(request.body);

            const { id: userId, role: userRole } = request.user;

            const indicator = await impactService.update(indicatorId, data, userId, userRole);

            return reply.status(200).send({
                message: "Indicador de impacto atualizado com sucesso",
                indicator,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof IndicatorNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            if (error instanceof IndicatorNotAssociatedError) {
                return reply.status(400).send({ error: error.message });
            }
            if (error instanceof IndicatorAccessDeniedError) {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao atualizar indicador de impacto" });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { indicatorId } = IndicatorIdParamSchema.parse(request.params);

            const { id: userId, role: userRole } = request.user;

            await impactService.delete(indicatorId, userId, userRole);

            return reply.status(200).send({ message: "Indicador de impacto deletado com sucesso" });
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({ error: formatZodError(error) });
            }
            if (error instanceof IndicatorNotFoundError) {
                return reply.status(404).send({ error: error.message });
            }
            if (error instanceof IndicatorNotAssociatedError) {
                return reply.status(400).send({ error: error.message });
            }
            if (error instanceof IndicatorAccessDeniedError) {
                return reply.status(403).send({ error: error.message });
            }
            console.error(error);
            return reply.status(500).send({ error: "Erro ao deletar indicador de impacto" });
        }
    },
};
