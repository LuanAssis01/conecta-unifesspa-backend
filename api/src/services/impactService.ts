import { prisma } from "../lib/prisma";
import { ImpactIndicator, CreateIndicatorInput, UpdateIndicatorInput } from "../types/impactIndicatorsTypes";

export class ProjectNotFoundError extends Error {
    constructor() {
        super("Projeto não encontrado");
        this.name = "ProjectNotFoundError";
    }
}

export class IndicatorNotFoundError extends Error {
    constructor() {
        super("Indicador não encontrado");
        this.name = "IndicatorNotFoundError";
    }
}

export class IndicatorNotAssociatedError extends Error {
    constructor() {
        super("Indicador não associado a um projeto válido");
        this.name = "IndicatorNotAssociatedError";
    }
}

export class IndicatorAccessDeniedError extends Error {
    constructor(action: string = "modificar") {
        super(`Acesso negado. Apenas o criador ou administrador podem ${action} indicadores.`);
        this.name = "IndicatorAccessDeniedError";
    }
}

export const impactService = {
    async create(
        projectId: string,
        indicators: CreateIndicatorInput[],
        userId: string,
        userRole: string
    ): Promise<ImpactIndicator[]> {
        // Busca o projeto
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { creatorId: true },
        });

        if (!project) {
            throw new ProjectNotFoundError();
        }

        const isCreator = project.creatorId === userId;
        const isAdmin = userRole === "ADMIN";

        if (!isCreator && !isAdmin) {
            throw new IndicatorAccessDeniedError("adicionar");
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
        return prisma.impactIndicator.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { id: "desc" },
        });
    },

    async getByProject(projectId: string): Promise<ImpactIndicator[]> {
        return prisma.impactIndicator.findMany({
            where: { projectId },
            orderBy: { id: "desc" },
        });
    },

    async update(
        indicatorId: string,
        data: UpdateIndicatorInput,
        userId: string,
        userRole: string
    ): Promise<ImpactIndicator> {
        const indicatorWithProject = await prisma.impactIndicator.findUnique({
            where: { id: indicatorId },
            include: {
                project: { select: { creatorId: true } },
            },
        });

        if (!indicatorWithProject) {
            throw new IndicatorNotFoundError();
        }

        if (!indicatorWithProject.project) {
            throw new IndicatorNotAssociatedError();
        }

        const isCreator = indicatorWithProject.project.creatorId === userId;
        const isAdmin = userRole === "ADMIN";

        if (!isCreator && !isAdmin) {
            throw new IndicatorAccessDeniedError("atualizar");
        }

        return prisma.impactIndicator.update({
            where: { id: indicatorId },
            data: {
                title: data.title,
                value: data.value,
            },
        });
    },

    async delete(
        indicatorId: string,
        userId: string,
        userRole: string
    ): Promise<void> {
        const indicatorWithProject = await prisma.impactIndicator.findUnique({
            where: { id: indicatorId },
            include: {
                project: { select: { creatorId: true } },
            },
        });

        if (!indicatorWithProject) {
            throw new IndicatorNotFoundError();
        }

        if (!indicatorWithProject.project) {
            throw new IndicatorNotAssociatedError();
        }

        const isCreator = indicatorWithProject.project.creatorId === userId;
        const isAdmin = userRole === "ADMIN";

        if (!isCreator && !isAdmin) {
            throw new IndicatorAccessDeniedError("deletar");
        }

        await prisma.impactIndicator.delete({
            where: { id: indicatorId },
        });
    },
};
