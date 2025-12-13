import { prisma } from "../lib/prisma";
import { FileService } from "./FileService";
import {
  Project,
  ProjectWithRelations,
  ProjectStatus,
  AudienceEnum,
  ProjectMetrics,
} from "../types/projectTypes";
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
} from "../valueObjects/projectValueObjec";

const DEFAULT_STATUS: ProjectStatus = "SUBMITTED";
const EDITABLE_STATUSES: ProjectStatus[] = ["APPROVED", "ACTIVE"];
const PUBLIC_STATUSES: ProjectStatus[] = ["ACTIVE", "FINISHED"];
export class ProjectNotFoundError extends Error {
  constructor(message = "Projeto não encontrado") {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectAccessDeniedError extends Error {
  constructor(message = "Acesso negado. Ação permitida apenas ao criador ou administrador.") {
    super(message);
    this.name = "ProjectAccessDeniedError";
  }
}

export class ProjectNotEditableError extends Error {
  constructor(message = "Projeto não pode ser editado no status atual") {
    super(message);
    this.name = "ProjectNotEditableError";
  }
}

export class InvalidStatusError extends Error {
  constructor(message = "Status inválido para esta ação") {
    super(message);
    this.name = "InvalidStatusError";
  }
}

export class InvalidFileError extends Error {
  constructor(message = "Arquivo inválido") {
    super(message);
    this.name = "InvalidFileError";
  }
}

const fileService = new FileService();

const checkPermission = (
  project: { creatorId: string | null },
  userId: string,
  userRole: string
): boolean => {
  const isCreator = project.creatorId === userId;
  const isAdmin = userRole === "ADMIN";
  return isCreator || isAdmin;
};

const isProjectEditable = (status: ProjectStatus): boolean => {
  return EDITABLE_STATUSES.includes(status);
};

export const projectService = {
  async create(data: CreateProjectInput, creatorId: string): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        expected_results: data.expected_results,
        start_date: new Date(data.start_date),
        duration: data.duration,
        numberVacancies: data.numberVacancies,
        audience: data.audience as AudienceEnum,
        courseId: data.courseId,
        creatorId,
        status: DEFAULT_STATUS,
      },
    });

    return project as Project;
  },

  async getAll(): Promise<ProjectWithRelations[]> {
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
      orderBy: { id: "desc" },
    });

    return projects as ProjectWithRelations[];
  },

  async getAllFiltered(filters: ProjectFilters): Promise<ProjectWithRelations[]> {
    const where: any = {};

    where.status = { in: PUBLIC_STATUSES };

    if (filters.status && PUBLIC_STATUSES.includes(filters.status.toUpperCase() as ProjectStatus)) {
      where.status = filters.status.toUpperCase();
    }

    if (filters.keywords) {
      const keywordIds = filters.keywords.split(",").map((id) => id.trim());
      where.keywords = {
        some: { id: { in: keywordIds } },
      };
    }

    if (filters.course) {
      where.courseId = filters.course;
    }

    if (filters.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    const projects = await prisma.project.findMany({
      where,
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
      orderBy: { id: "desc" },
    });

    return projects as ProjectWithRelations[];
  },

  async getById(projectId: string): Promise<ProjectWithRelations> {
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
      throw new ProjectNotFoundError();
    }

    return project as ProjectWithRelations;
  },

  async update(
    projectId: string,
    data: UpdateProjectInput,
    userId: string,
    userRole: string
  ): Promise<Project> {
    const existing = await prisma.project.findUnique({ where: { id: projectId } });

    if (!existing) {
      throw new ProjectNotFoundError();
    }

    if (!checkPermission(existing, userId, userRole)) {
      throw new ProjectAccessDeniedError();
    }

    if (!isProjectEditable(existing.status as ProjectStatus)) {
      throw new ProjectNotEditableError();
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        expected_results: data.expected_results ?? existing.expected_results,
        start_date: data.start_date ? new Date(data.start_date) : existing.start_date,
        duration: data.duration ?? existing.duration,
        numberVacancies: data.numberVacancies ?? existing.numberVacancies,
        audience: data.audience ? (data.audience as AudienceEnum) : existing.audience,
        subtitle: data.subtitle ?? existing.subtitle,
        overview: data.overview ?? existing.overview,
        registration_form_url: data.registration_form_url ?? existing.registration_form_url,
        status: data.status ?? existing.status,
      },
    });

    return updatedProject as Project;
  },

  async delete(projectId: string, userId: string, userRole: string): Promise<void> {
    const existing = await prisma.project.findUnique({ where: { id: projectId } });

    if (!existing) {
      throw new ProjectNotFoundError();
    }

    if (!checkPermission(existing, userId, userRole)) {
      throw new ProjectAccessDeniedError();
    }

    if (existing.proposal_document_url) {
      await fileService.deleteFile(existing.proposal_document_url);
    }
    if (existing.img_url) {
      await fileService.deleteFile(existing.img_url);
    }

    await prisma.project.delete({ where: { id: projectId } });
  },

  async updateProposal(
    projectId: string,
    file: any,
    userId: string
  ): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    if (project.creatorId !== userId) {
      throw new ProjectAccessDeniedError("Acesso negado.");
    }

    if (!isProjectEditable(project.status as ProjectStatus)) {
      throw new ProjectNotEditableError();
    }

    const ext = file.filename?.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      throw new InvalidFileError("Apenas arquivos PDF são aceitos");
    }

    if (project.proposal_document_url) {
      await fileService.deleteFile(project.proposal_document_url);
    }

    const proposal_document_url = await fileService.saveProposalFile(file);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { proposal_document_url },
    });

    return updatedProject as Project;
  },

  async updateImage(
    projectId: string,
    file: any,
    userId: string,
    userRole: string
  ): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    if (!checkPermission(project, userId, userRole)) {
      throw new ProjectAccessDeniedError();
    }

    if (!isProjectEditable(project.status as ProjectStatus)) {
      throw new ProjectNotEditableError();
    }

    const ext = file.filename?.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      throw new InvalidFileError("Tipo de imagem não suportado. Use JPG, JPEG, PNG ou GIF");
    }

    if (project.img_url) {
      await fileService.deleteFile(project.img_url);
    }

    const img_url = await fileService.saveProjectPhoto(file);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { img_url },
    });

    return updatedProject as Project;
  },

  async updateStatus(
    projectId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new ProjectNotFoundError();
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    return updatedProject as Project;
  },

  async getMetrics(): Promise<ProjectMetrics> {
    const [total, active, finished] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "FINISHED" } }),
    ]);

    return {
      total,
      active,
      finished,
      inactive: total - (active + finished),
    };
  },
};
