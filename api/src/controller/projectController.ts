import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { AudienceEnum, ProjectStatus } from "@prisma/client";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const projectController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        name,
        subtitle,
        overview,
        description,
        expected_results,
        start_date,
        duration,
        proposal_document_url,
        registration_form_url,
        numberVacancies,
        status,
        audience,
        courseId,
        creatorId,
      } = request.body as {
        name: string;
        subtitle?: string;
        overview?: string;
        description?: string;
        expected_results?: string;
        start_date: string;
        duration: string;
        proposal_document_url?: string;
        registration_form_url?: string;
        numberVacancies: number;
        status: ProjectStatus;
        audience: AudienceEnum;
        courseId?: number;
        creatorId?: number;
      };

      const file = (request as any).file;

      if (!file) {
        return reply.status(400).send({ error: "Imagem é obrigatória" });
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: "anuli_projects",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      });

      const project = await prisma.project.create({
        data: {
          name,
          subtitle,
          overview,
          description,
          expected_results,
          start_date: new Date(start_date),
          duration: new Date(duration),
          proposal_document_url,
          registration_form_url,
          numberVacancies,
          status,
          audience,
          img_url: result.secure_url,
          courseId,
          creatorId,
        },
        include: {
          course: true,
          creator: true,
          keywords: true,
          impactIndicators: true,
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
          creator: true,
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

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const project = await prisma.project.findUnique({
        where: { id: Number(id) },
        include: {
          course: true,
          creator: true,
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

      const {
        name,
        subtitle,
        overview,
        description,
        expected_results,
        start_date,
        duration,
        proposal_document_url,
        registration_form_url,
        numberVacancies,
        status,
        audience,
        courseId,
      } = request.body as Partial<{
        name: string;
        subtitle: string;
        overview: string;
        description: string;
        expected_results: string;
        start_date: string;
        duration: string;
        proposal_document_url: string;
        registration_form_url: string;
        numberVacancies: number;
        status: ProjectStatus;
        audience: AudienceEnum;
        courseId: number;
      }>;

      const existing = await prisma.project.findUnique({ where: { id: Number(id) } });
      if (!existing) {
        return reply.status(404).send({ error: "Projeto não encontrado" });
      }

      const file = (request as any).file;
      let img_url = existing.img_url;

      if (file) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "anuli_projects",
          transformation: [{ width: 800, height: 800, crop: "limit" }],
        });
        img_url = result.secure_url;
      }

      const updated = await prisma.project.update({
        where: { id: Number(id) },
        data: {
          name,
          subtitle,
          overview,
          description,
          expected_results,
          start_date: start_date ? new Date(start_date) : existing.start_date,
          duration: duration ? new Date(duration) : existing.duration,
          proposal_document_url,
          registration_form_url,
          numberVacancies,
          status,
          audience,
          img_url,
          courseId,
        },
        include: {
          course: true,
          creator: true,
          keywords: true,
          impactIndicators: true,
        },
      });

      return reply.status(200).send({
        message: "Projeto atualizado com sucesso",
        project: updated,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao atualizar projeto" });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const existing = await prisma.project.findUnique({ where: { id: Number(id) } });
      if (!existing) {
        return reply.status(404).send({ error: "Projeto não encontrado" });
      }

      await prisma.project.delete({ where: { id: Number(id) } });

      return reply.status(200).send({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao deletar projeto" });
    }
  },
};

