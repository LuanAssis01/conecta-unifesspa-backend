import { FastifyRequest, FastifyReply } from "fastify";
import { FileService } from "../services/FileService";
import { prisma } from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { AudienceEnum, ProjectStatus, UserRole } from "@prisma/client";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileService = new FileService();

export const projectController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const creatorIdFromToken = request.user.id;

      const {
        name,
        description,
        expected_results,
        start_date,
        duration,
        numberVacancies,
        audience,
        courseId
      } = request.body as any;

      const requiredFields = ["name", "description", "expected_results", "start_date", "duration", "numberVacancies", "audience", "courseId"];
      const missingFields = requiredFields.filter(field => !(request.body as any)[field]);

      if (missingFields.length > 0) {
        return reply.status(400).send({ error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}` });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          expected_results,
          start_date: new Date(start_date),
          duration: Number(duration),
          numberVacancies: Number(numberVacancies),
          audience: audience as AudienceEnum,
          courseId,
          creatorId: creatorIdFromToken,
          status: ProjectStatus.SUBMITTED,
        },
      });

      return reply.status(201).send({
        message: "Projeto criado com sucesso",
        project,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao criar projeto" });
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projects = await prisma.project.findMany({
        include: {
          course: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          keywords: true,
          impactIndicators: true,
        },
        orderBy: { id: "desc" },
      });

      return reply.status(200).send(projects);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar projetos" });
    }
  },

  async getAllFiltered(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { keywords, course, status, search } = request.query as {
        keywords?: string,
        course?: string,
        status?: string,
        search?: string
      };

      const filters: any = {}

      filters.status = { in: ["ACTIVE", "FINISHED"] };

      if (status && ["ACTIVE", "FINISHED"].includes(status.toUpperCase())) {
        filters.status = status.toUpperCase();
      }

      if (keywords) {
        const keywordIds = keywords
          .split(",")
          .map((id) => id.trim());
        filters.keywords = {
          some: { id: { in: keywordIds } }
        };
      }

      if (course) {
        filters.courseId = course;
      }

      if (status) {
        filters.status = status as any;
      }

      if (search) {
        filters.name = { contains: search, mode: "insensitive" };
      }

      const projects = await prisma.project.findMany({
        where: filters,
        include: {
          course: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          keywords: true,
          impactIndicators: true,
        },
        orderBy: { id: "desc" },
      });

      return reply.status(200).send(projects);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error: "Erro ao buscar projetos"
      });
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          course: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          keywords: true,
          impactIndicators: true,
        },
      });

      if (!project) {
        return reply.status(404).send({ error: "Projeto não encontrado" });
      }

      return reply.status(200).send(project);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar projeto" });
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { id: userId, role: userRole } = request.user;

      const existing = await prisma.project.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: "Projeto não encontrado" });

      const isCreator = existing.creatorId === userId;
      const isAdmin = userRole === UserRole.ADMIN;

      if (!isCreator && !isAdmin) {
        return reply.status(403).send({ error: "Acesso negado. Ação permitida apenas ao criador ou administrador." });
      };

      if (existing.status !== ProjectStatus.APPROVED && existing.status !== ProjectStatus.ACTIVE) {
        return reply.status(403).send({ error: "Projeto não pode ser editado" });
      }

      const fields = request.body as any;

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name: fields.name ?? existing.name,
          description: fields.description ?? existing.description,
          expected_results: fields.expected_results ?? existing.expected_results,
          start_date: fields.start_date ? new Date(fields.start_date) : existing.start_date,
          duration: fields.duration ? Number(fields.duration) : existing.duration,
          numberVacancies: fields.numberVacancies ? Number(fields.numberVacancies) : existing.numberVacancies,
          audience: fields.audience ? (fields.audience as AudienceEnum) : existing.audience,
          subtitle: fields.subtitle ?? existing.subtitle,
          overview: fields.overview ?? existing.overview,
          registration_form_url: fields.registration_form_url ?? existing.registration_form_url,
          status: fields.status ?? existing.status,
        },
      });

      return reply.status(200).send({ message: "Projeto atualizado com sucesso", project: updatedProject });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar projeto" });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const { id: userId, role: userRole } = request.user;

      const existing = await prisma.project.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: "Projeto não encontrado" });

      const isCreator = existing.creatorId === userId;
      const isAdmin = userRole === UserRole.ADMIN;

      if (!isCreator && !isAdmin) {
        return reply.status(403).send({ error: "Acesso negado. Ação permitida apenas ao criador ou administrador." });
      }

      if (existing.proposal_document_url) await fileService.deleteFile(existing.proposal_document_url);
      if (existing.img_url) await fileService.deleteFile(existing.img_url);

      await prisma.project.delete({ where: { id } });

      return reply.status(200).send({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao deletar projeto" });
    }
  },

  async updateProposal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return reply.status(404).send({ error: "Projeto não encontrado" });

      const { id: userId, role: userRole } = request.user;

      const isCreator = project.creatorId === userId;

      if (!isCreator) {
        return reply.status(403).send({ error: "Acesso negado." });
      }

      if (project.status !== ProjectStatus.APPROVED && project.status !== ProjectStatus.ACTIVE) {
        return reply.status(403).send({ error: "Projeto não pode ser editado" });
      }

      for await (const part of request.parts()) {
        if (part.type === "file") {
          // sempre PDF aqui
          if (part.filename.split(".").pop()?.toLowerCase() !== "pdf") {
            return reply.status(400).send({ error: "Apenas arquivos PDF são aceitos" });
          }
          if (project.proposal_document_url) await fileService.deleteFile(project.proposal_document_url);
          const proposal_document_url = await fileService.saveProposalFile(part);

          const updatedProject = await prisma.project.update({
            where: { id },
            data: { proposal_document_url },
          });

          return reply.status(200).send({ message: "Proposta atualizada com sucesso", project: updatedProject });
        }
      }

      return reply.status(400).send({ error: "Nenhum arquivo enviado" });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar proposta" });
    }
  },

  async updateImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return reply.status(404).send({ error: "Projeto não encontrado" });

      const { id: userId, role: userRole } = request.user;

      const isCreator = project.creatorId === userId;
      const isAdmin = userRole === UserRole.ADMIN;

      if (!isCreator && !isAdmin) {
        return reply.status(403).send({ error: "Acesso negado. Ação permitida apenas ao criador ou administrador." });
      }

      if (project.status !== ProjectStatus.APPROVED && project.status !== ProjectStatus.ACTIVE) {
        return reply.status(403).send({ error: "Projeto não pode ser editado" });
      }

      for await (const part of request.parts()) {
        if (part.type === "file") {
          const ext = part.filename.split(".").pop()?.toLowerCase();
          if (!["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
            return reply.status(400).send({ error: "Tipo de imagem não suportado" });
          }
          if (project.img_url) await fileService.deleteFile(project.img_url);
          const img_url = await fileService.saveProjectPhoto(part);

          const updatedProject = await prisma.project.update({
            where: { id },
            data: { img_url },
          });

          return reply.status(200).send({ message: "Imagem atualizada com sucesso", project: updatedProject });
        }
      }

      return reply.status(400).send({ error: "Nenhum arquivo enviado" });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar imagem" });
    }
  },

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: ProjectStatus };

      // Verifica se o status enviado é válido para aprovação/rejeição
      if (status !== ProjectStatus.APPROVED && status !== ProjectStatus.REJECTED) {
        return reply.status(400).send({ error: "Status inválido para esta ação" });
      }

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return reply.status(404).send({ error: "Projeto não encontrado" });

      // se o usuário é diretor (autorização)
      // Ex: if (request.user.role !== "DIRECTOR") return reply.status(403).send({ error: "Não autorizado" });

      const updatedProject = await prisma.project.update({
        where: { id },
        data: { status },
      });

      return reply.status(200).send({ message: `Projeto ${status.toLowerCase()}`, project: updatedProject });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar status do projeto" });
    }
  },

  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const total = await prisma.project.count();
      const active = await prisma.project.count({
        where: { status: ProjectStatus.ACTIVE }
      });
      const finished = await prisma.project.count({
        where: { status: ProjectStatus.FINISHED }
      });

      return reply.status(200).send({
        total,
        active,
        finished,
        inactive: total - (active + finished) // opcional: se quiser ver quantos estão em outros status
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar métricas de projetos" });
    }
  }
};

