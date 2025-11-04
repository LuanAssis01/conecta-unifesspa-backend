import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

interface CreateIndicatorsDTO {
  projectId: string;
  indicators: Array<{ title: string; value: number }>;
  userId: string;
  userRole: UserRole;
}

interface UpdateIndicatorDTO {
  indicatorId: string;
  title?: string;
  value?: number;
  userId: string;
  userRole: UserRole;
}

export const indicatorsService = {
  async create(data: CreateIndicatorsDTO) {
    const { projectId, indicators, userId, userRole } = data;

    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      throw new Error('Indicadores são obrigatórios');
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

    const createdIndicators = await Promise.all(
      indicators.map((ind) =>
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

    return createdIndicators;
  },

  async getAll() {
    const indicators = await prisma.impactIndicator.findMany({
      include: { project: true },
    });
    return indicators;
  },

  async update(data: UpdateIndicatorDTO) {
    const { indicatorId, title, value, userId, userRole } = data;

    const indicatorWithProject = await prisma.impactIndicator.findUnique({
      where: { id: indicatorId },
      include: { project: { select: { creatorId: true } } },
    });

    if (!indicatorWithProject) {
      throw new Error('Indicador não encontrado');
    }

    if (!indicatorWithProject.project) {
      throw new Error('Indicador não associado a um projeto válido');
    }

    const isCreator = indicatorWithProject.project.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    const indicator = await prisma.impactIndicator.update({
      where: { id: indicatorId },
      data: {
        title,
        value,
      },
    });

    return indicator;
  },

  async delete(indicatorId: string, userId: string, userRole: UserRole) {
    const indicatorWithProject = await prisma.impactIndicator.findUnique({
      where: { id: indicatorId },
      include: { project: { select: { creatorId: true } } },
    });

    if (!indicatorWithProject) {
      throw new Error('Indicador não encontrado');
    }

    if (!indicatorWithProject.project) {
      throw new Error('Indicador não associado a um projeto válido');
    }

    const isCreator = indicatorWithProject.project.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    await prisma.impactIndicator.delete({
      where: { id: indicatorId },
    });
  },

  async getByProject(projectId: string) {
    const indicators = await prisma.impactIndicator.findMany({
      where: { projectId },
    });

    return indicators;
  },
};
