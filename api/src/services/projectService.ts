import { prisma } from '../lib/prisma';
import { AudienceEnum, ProjectStatus, UserRole } from '@prisma/client';

interface CreateProjectDTO {
  name: string;
  description: string;
  expected_results: string;
  start_date: string;
  duration: number;
  numberVacancies: number;
  audience: AudienceEnum;
  courseId: string;
  creatorId: string;
}

interface UpdateProjectDTO {
  projectId: string;
  userId: string;
  userRole: UserRole;
  fields: {
    name?: string;
    description?: string;
    expected_results?: string;
    start_date?: string;
    duration?: number;
    numberVacancies?: number;
    audience?: AudienceEnum;
    subtitle?: string;
    overview?: string;
    registration_form_url?: string;
    status?: ProjectStatus;
  };
}

interface FilterProjectsDTO {
  keywords?: string;
  course?: string;
  status?: string;
  search?: string;
}

export const projectService = {
  async create(data: CreateProjectDTO) {
    const requiredFields = ['name', 'description', 'expected_results', 'start_date', 'duration', 'numberVacancies', 'audience', 'courseId'];
    const missingFields = requiredFields.filter(field => !data[field as keyof CreateProjectDTO]);

    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
    }

    try {
      const project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          expected_results: data.expected_results,
          start_date: new Date(data.start_date),
          duration: Number(data.duration),
          numberVacancies: Number(data.numberVacancies),
          audience: data.audience,
          courseId: data.courseId,
          creatorId: data.creatorId,
          status: ProjectStatus.SUBMITTED,
        },
      });

      return project;
    } catch (error: any) {
      // Erros do Prisma
      if (error.code === 'P2003') {
        throw new Error('Curso não encontrado ou inválido');
      }
      if (error.code === 'P2002') {
        throw new Error('Já existe um projeto com esses dados');
      }
      throw error; // Reenviar outros erros
    }
  },

  async getAll() {
    const projects = await prisma.project.findMany({
      include: {
        course: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        keywords: true,
        impactIndicators: true,
      },
      orderBy: { id: 'desc' },
    });

    return projects;
  },

  async getAllFiltered(filters: FilterProjectsDTO) {
    const { keywords, course, status, search } = filters;
    const prismaFilters: any = {};

    prismaFilters.status = { in: ['ACTIVE', 'FINISHED'] };

    if (status && ['ACTIVE', 'FINISHED'].includes(status.toUpperCase())) {
      prismaFilters.status = status.toUpperCase();
    }

    if (keywords) {
      const keywordIds = keywords.split(',').map((id) => id.trim());
      prismaFilters.keywords = {
        some: { id: { in: keywordIds } },
      };
    }

    if (course) {
      prismaFilters.courseId = course;
    }

    if (search) {
      prismaFilters.name = { contains: search, mode: 'insensitive' };
    }

    const projects = await prisma.project.findMany({
      where: prismaFilters,
      include: {
        course: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        keywords: true,
        impactIndicators: true,
      },
      orderBy: { id: 'desc' },
    });

    return projects;
  },

  async getById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        course: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        keywords: true,
        impactIndicators: true,
      },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    return project;
  },

  async update(data: UpdateProjectDTO) {
    const { projectId, userId, userRole, fields } = data;

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!existing) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = existing.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    if (existing.status !== ProjectStatus.APPROVED && existing.status !== ProjectStatus.ACTIVE) {
      throw new Error('Projeto não pode ser editado neste status');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: fields.name ?? existing.name,
        description: fields.description ?? existing.description,
        expected_results: fields.expected_results ?? existing.expected_results,
        start_date: fields.start_date ? new Date(fields.start_date) : existing.start_date,
        duration: fields.duration ? Number(fields.duration) : existing.duration,
        numberVacancies: fields.numberVacancies ? Number(fields.numberVacancies) : existing.numberVacancies,
        audience: fields.audience ?? existing.audience,
        subtitle: fields.subtitle ?? existing.subtitle,
        overview: fields.overview ?? existing.overview,
        registration_form_url: fields.registration_form_url ?? existing.registration_form_url,
        status: fields.status ?? existing.status,
      },
    });

    return updatedProject;
  },

  async delete(data: { projectId: string; userId: string; userRole: UserRole }) {
    const { projectId, userId, userRole } = data;
    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!existing) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = existing.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    await prisma.project.delete({ where: { id: projectId } });
    
    return { 
      proposal_document_url: existing.proposal_document_url,
      img_url: existing.img_url
    };
  },

  async validateProposalUpdate(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = project.creatorId === userId;

    if (!isCreator) {
      throw new Error('Acesso negado');
    }

    if (project.status !== ProjectStatus.APPROVED && project.status !== ProjectStatus.ACTIVE) {
      throw new Error('Projeto não pode ser editado neste status');
    }

    return project;
  },

  async validateImageUpdate(projectId: string, userId: string, userRole: UserRole) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = project.creatorId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('Acesso negado');
    }

    if (project.status !== ProjectStatus.APPROVED && project.status !== ProjectStatus.ACTIVE) {
      throw new Error('Projeto não pode ser editado neste status');
    }

    return project;
  },

  async updateProposalUrl(projectId: string, url: string) {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { proposal_document_url: url },
    });

    return updatedProject;
  },

  async updateImageUrl(projectId: string, url: string) {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { img_url: url },
    });

    return updatedProject;
  },

  async checkPermissionAndStatus(projectId: string, userId: string, requireAdmin: boolean = false) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const isCreator = project.creatorId === userId;

    if (requireAdmin) {
      if (!isCreator) {
        throw new Error('Acesso negado');
      }
    }

    if (project.status !== ProjectStatus.APPROVED && project.status !== ProjectStatus.ACTIVE) {
      throw new Error('Projeto não pode ser editado neste status');
    }

    return project;
  },

  async updateProjectFile(projectId: string, fileUrl: string, fileType: 'proposal' | 'image') {
    const data = fileType === 'proposal' 
      ? { proposal_document_url: fileUrl }
      : { img_url: fileUrl };

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return updatedProject;
  },

  async updateStatus(projectId: string, status: ProjectStatus) {
    if (status !== ProjectStatus.APPROVED && status !== ProjectStatus.REJECTED) {
      throw new Error('Status inválido para esta ação');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    return updatedProject;
  },

  async getMetrics() {
    const total = await prisma.project.count();
    const active = await prisma.project.count({
      where: { status: ProjectStatus.ACTIVE },
    });
    const finished = await prisma.project.count({
      where: { status: ProjectStatus.FINISHED },
    });

    return {
      total,
      active,
      finished,
      inactive: total - (active + finished),
    };
  },
};
