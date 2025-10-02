import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const projectController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { title, description } = request.body as {
        title: string;
        description: string;
      };

      // O arquivo vem do fastify-multer
      const file = (request as any).file;

      if (!file) {
        return reply.status(400).send({ error: "Imagem é obrigatória" });
      }

      // Upload para Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "anuli_projects",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      });

      // Salva no banco junto com a URL da imagem
      const project = await prisma.project.create({
        data: {
          title,
          description,
          img_url: result.secure_url, // campo no banco
        },
      });

      return reply.status(201).send({
        message: "Projeto criado com sucesso",
        project,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro interno ao criar projeto" });
    }
  },
};

