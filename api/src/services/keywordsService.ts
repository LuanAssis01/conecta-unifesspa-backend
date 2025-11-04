import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

interface CreateKeywordsDTO {
  projectId: string;
  keywords: string[];
  userId: string;
  userRole: UserRole;
}

export const keywordsService = {
  async create(data: CreateKeywordsDTO) {
    const { projectId, keywords, userId, userRole } = data;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Palavras-chave são obrigatórias');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = project.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    const createdKeywords = [];

    for (const keywordName of keywords) {
      if (!keywordName || keywordName.trim() === '') continue;

      const keyword = await prisma.keyword.upsert({
        where: { name: keywordName },
        update: {
          project: { connect: { id: projectId } },
        },
        create: {
          name: keywordName,
          project: { connect: { id: projectId } },
        },
      });

      createdKeywords.push(keyword);
    }

    return createdKeywords;
  },

  async getAll() {
    const keywords = await prisma.keyword.findMany();
    return keywords;
  },

  async removeFromProject(projectId: string, keywordId: string) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        keywords: {
          disconnect: { id: keywordId },
        },
      },
    });
  },

  async getByProject(projectId: string) {
    const keywords = await prisma.keyword.findMany({
      where: { project: { some: { id: projectId } } },
    });

    return keywords;
  },

  async getProjects(keywordId: string) {
    const keyword = await prisma.keyword.findUnique({
      where: { id: keywordId },
      include: {
        project: true,
      },
    });

    if (!keyword) {
      throw new Error('Palavra-chave não encontrada');
    }

    return keyword.project;
  },
};
