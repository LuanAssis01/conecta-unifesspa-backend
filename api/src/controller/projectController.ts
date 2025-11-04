import { FastifyRequest, FastifyReply } from "fastify";
import { FileService } from "../services/FileService";
import { projectService } from "../services/projectService";
import { ResponseHandler } from "../utils/responseHandler";
import { AudienceEnum, ProjectStatus } from "@prisma/client";

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

      const project = await projectService.create({
        name,
        description,
        expected_results,
        start_date,
        duration,
        numberVacancies,
        audience: audience as AudienceEnum,
        courseId,
        creatorId: creatorIdFromToken,
      });

      return ResponseHandler.created(reply, "Projeto criado com sucesso", { project });
    } catch (error: any) {
      console.error(error);
      
      if (error.message?.startsWith('Campos obrigatórios')) {
        return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
      }
      
      if (error.message === 'Curso não encontrado ou inválido') {
        return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
      }
      
      if (error.message === 'Já existe um projeto com esses dados') {
        return ResponseHandler.conflict(reply, 'Recurso já existe', error.message);
      }
      
      // Erro genérico com detalhes do erro original
      return ResponseHandler.internalError(reply, "Erro ao criar projeto", error.message || 'Erro desconhecido');
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projects = await projectService.getAll();
      return ResponseHandler.ok(reply, "Projetos recuperados com sucesso", { projects });
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.internalError(reply, "Erro ao buscar projetos", error.message);
    }
  },

  async getAllFiltered(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { keywords, course, status, search } = request.query as {
        keywords?: string;
        course?: string;
        status?: string;
        search?: string;
      };

      const projects = await projectService.getAllFiltered({
        keywords,
        course,
        status,
        search,
      });

      return ResponseHandler.ok(reply, "Projetos filtrados recuperados com sucesso", { projects });
    } catch (error) {
      console.error(error);
      return ResponseHandler.internalError(reply, "Erro ao buscar projetos");
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const project = await projectService.getById(id);

      if (!project) {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", "Projeto não encontrado");
      }

      return ResponseHandler.ok(reply, "Projeto recuperado com sucesso", { project });
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.internalError(reply, "Erro ao buscar projeto", error.message);
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { id: userId, role: userRole } = request.user;
      const fields = request.body as any;

      const updatedProject = await projectService.update({
        projectId: id,
        userId,
        userRole,
        fields,
      });

      return ResponseHandler.ok(reply, "Projeto atualizado com sucesso", { project: updatedProject });
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Projeto não encontrado') {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", error.message);
      }
      
      if (error.message === 'Acesso negado' || error.message?.includes('não pode ser editado')) {
        return ResponseHandler.forbidden(reply, "Acesso negado", error.message);
      }
      
      return ResponseHandler.internalError(reply, "Erro ao atualizar projeto", error.message);
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { id: userId, role: userRole } = request.user;

      const { proposal_document_url, img_url } = await projectService.delete({
        projectId: id,
        userId,
        userRole,
      });

      if (proposal_document_url) await fileService.deleteFile(proposal_document_url);
      if (img_url) await fileService.deleteFile(img_url);

      return ResponseHandler.ok(reply, "Projeto deletado com sucesso");
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Projeto não encontrado') {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", error.message);
      }
      
      if (error.message === 'Acesso negado') {
        return ResponseHandler.forbidden(reply, "Acesso negado", error.message);
      }
      
      return ResponseHandler.internalError(reply, "Erro ao deletar projeto", error.message);
    }
  },

  async updateProposal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { id: userId } = request.user;

      const project = await projectService.validateProposalUpdate(id, userId);

      for await (const part of request.parts()) {
        if (part.type === "file") {
          if (part.filename.split(".").pop()?.toLowerCase() !== "pdf") {
            return ResponseHandler.badRequest(reply, "Tipo de arquivo inválido", "Apenas arquivos PDF são aceitos");
          }

          if (project.proposal_document_url) {
            await fileService.deleteFile(project.proposal_document_url);
          }

          const proposal_document_url = await fileService.saveProposalFile(part);

          const updatedProject = await projectService.updateProposalUrl(id, proposal_document_url);

          return ResponseHandler.ok(reply, "Proposta atualizada com sucesso", { project: updatedProject });
        }
      }

      return ResponseHandler.badRequest(reply, "Requisição inválida", "Nenhum arquivo enviado");
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Projeto não encontrado') {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", error.message);
      }
      
      if (error.message === 'Acesso negado' || error.message?.includes('não pode ser editado')) {
        return ResponseHandler.forbidden(reply, "Acesso negado", error.message);
      }
      
      return ResponseHandler.internalError(reply, "Erro ao atualizar proposta", error.message);
    }
  },

  async updateImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { id: userId, role: userRole } = request.user;

      const project = await projectService.validateImageUpdate(id, userId, userRole);

      for await (const part of request.parts()) {
        if (part.type === "file") {
          const ext = part.filename.split(".").pop()?.toLowerCase();
          if (!["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
            return ResponseHandler.badRequest(reply, "Tipo de arquivo inválido", "Tipo de imagem não suportado");
          }

          if (project.img_url) {
            await fileService.deleteFile(project.img_url);
          }

          const img_url = await fileService.saveProjectPhoto(part);

          const updatedProject = await projectService.updateImageUrl(id, img_url);

          return ResponseHandler.ok(reply, "Imagem atualizada com sucesso", { project: updatedProject });
        }
      }

      return ResponseHandler.badRequest(reply, "Requisição inválida", "Nenhum arquivo enviado");
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Projeto não encontrado') {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", error.message);
      }
      
      if (error.message === 'Acesso negado' || error.message?.includes('não pode ser editado')) {
        return ResponseHandler.forbidden(reply, "Acesso negado", error.message);
      }
      
      return ResponseHandler.internalError(reply, "Erro ao atualizar imagem", error.message);
    }
  },

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: ProjectStatus };

      const updatedProject = await projectService.updateStatus(id, status);

      return ResponseHandler.ok(reply, "Status do projeto atualizado com sucesso", { project: updatedProject });
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Projeto não encontrado') {
        return ResponseHandler.notFound(reply, "Recurso não encontrado", error.message);
      }
      
      if (error.message === 'Status inválido para esta ação') {
        return ResponseHandler.badRequest(reply, "Requisição inválida", error.message);
      }
      
      return ResponseHandler.internalError(reply, "Erro ao atualizar status do projeto", error.message);
    }
  },

  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const metrics = await projectService.getMetrics();
      return ResponseHandler.ok(reply, "Métricas recuperadas com sucesso", metrics);
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.internalError(reply, "Erro ao buscar métricas de projetos", error.message);
    }
  }
};
