import { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  projectService,
  ProjectNotFoundError,
  ProjectAccessDeniedError,
  ProjectNotEditableError,
  InvalidFileError,
} from "../services/projectsService";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectIdParamSchema,
  ProjectFiltersSchema,
  UpdateStatusSchema,
} from "../valueObjects/projectValueObjec";

const formatZodError = (error: ZodError): string => {
  return error.issues.map((err: any) => err.message).join(", ");
};

export const projectController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const creatorId = request.user.id;

      const validatedData = CreateProjectSchema.parse(request.body);

      const project = await projectService.create(validatedData, creatorId);

      return reply.status(201).send({
        message: "Projeto criado com sucesso",
        project,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao criar projeto" });
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projects = await projectService.getAll();
      return reply.status(200).send(projects);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar projetos" });
    }
  },

  async getAllFiltered(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = ProjectFiltersSchema.parse(request.query);

      const projects = await projectService.getAllFiltered(filters);

      return reply.status(200).send(projects);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar projetos" });
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);

      const project = await projectService.getById(id);

      return reply.status(200).send(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar projeto" });
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);
      const { id: userId, role: userRole } = request.user;

      const validatedData = UpdateProjectSchema.parse(request.body);

      const project = await projectService.update(id, validatedData, userId, userRole);

      return reply.status(200).send({
        message: "Projeto atualizado com sucesso",
        project,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof ProjectAccessDeniedError) {
        return reply.status(403).send({ error: error.message });
      }
      if (error instanceof ProjectNotEditableError) {
        return reply.status(403).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar projeto" });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);
      const { id: userId, role: userRole } = request.user;

      await projectService.delete(id, userId, userRole);

      return reply.status(200).send({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof ProjectAccessDeniedError) {
        return reply.status(403).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao deletar projeto" });
    }
  },

  async updateProposal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);
      const { id: userId } = request.user;

      for await (const part of request.parts()) {
        if (part.type === "file") {
          const project = await projectService.updateProposal(id, part, userId);

          return reply.status(200).send({
            message: "Proposta atualizada com sucesso",
            project,
          });
        }
      }

      return reply.status(400).send({ error: "Nenhum arquivo enviado" });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof ProjectAccessDeniedError) {
        return reply.status(403).send({ error: error.message });
      }
      if (error instanceof ProjectNotEditableError) {
        return reply.status(403).send({ error: error.message });
      }
      if (error instanceof InvalidFileError) {
        return reply.status(400).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar proposta" });
    }
  },

  async updateImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);
      const { id: userId, role: userRole } = request.user;

      for await (const part of request.parts()) {
        if (part.type === "file") {
          const project = await projectService.updateImage(id, part, userId, userRole);

          return reply.status(200).send({
            message: "Imagem atualizada com sucesso",
            project,
          });
        }
      }

      return reply.status(400).send({ error: "Nenhum arquivo enviado" });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof ProjectAccessDeniedError) {
        return reply.status(403).send({ error: error.message });
      }
      if (error instanceof ProjectNotEditableError) {
        return reply.status(403).send({ error: error.message });
      }
      if (error instanceof InvalidFileError) {
        return reply.status(400).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar imagem" });
    }
  },

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = ProjectIdParamSchema.parse(request.params);

      const { status } = UpdateStatusSchema.parse(request.body);

      const project = await projectService.updateStatus(id, status);

      return reply.status(200).send({
        message: `Projeto ${status.toLowerCase()}`,
        project,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar status do projeto" });
    }
  },

  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const metrics = await projectService.getMetrics();
      return reply.status(200).send(metrics);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar métricas de projetos" });
    }
  },
};

