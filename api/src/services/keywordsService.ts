import { prisma } from "../lib/prisma";
import { Keyword } from "../types/keywordsTypes";

export class ProjectNotFoundError extends Error {
    constructor() {
        super("Projeto não encontrado");
        this.name = "ProjectNotFoundError";
    }
}

export class KeywordNotFoundError extends Error {
    constructor() {
        super("Palavra-chave não encontrada");
        this.name = "KeywordNotFoundError";
    }
}

export class KeywordAccessDeniedError extends Error {
    constructor() {
        super("Acesso negado. Apenas o criador ou administrador podem modificar as palavras-chave.");
        this.name = "KeywordAccessDeniedError";
    }
}

export const keywordsService = {
    async create(
        projectId: string,
        keywords: string[],
        userId: string,
        userRole: string
    ): Promise<Keyword[]> {
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
            throw new KeywordAccessDeniedError();
        }

        const createdKeywords: Keyword[] = [];

        for (const keywordName of keywords) {
            if (!keywordName || keywordName.trim() === "") continue;

            const keyword = await prisma.keyword.upsert({
                where: { name: keywordName.trim() },
                update: {
                    project: { connect: { id: projectId } },
                },
                create: {
                    name: keywordName.trim(),
                    project: { connect: { id: projectId } },
                },
            });

            createdKeywords.push(keyword);
        }

        return createdKeywords;
    },

    async getAll(): Promise<Keyword[]> {
        return prisma.keyword.findMany({
            orderBy: { name: "asc" },
        });
    },

    async getByProject(projectId: string): Promise<Keyword[]> {
        return prisma.keyword.findMany({
            where: {
                project: { some: { id: projectId } },
            },
            orderBy: { name: "asc" },
        });
    },

    async getProjectsByKeyword(keywordId: string) {
        const keyword = await prisma.keyword.findUnique({
            where: { id: keywordId },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        description: true,
                        creator: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!keyword) {
            throw new KeywordNotFoundError();
        }

        return keyword.project;
    },

    async removeFromProject(
        projectId: string,
        keywordId: string,
        userId: string,
        userRole: string
    ): Promise<void> {
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
            throw new KeywordAccessDeniedError();
        }

        await prisma.project.update({
            where: { id: projectId },
            data: {
                keywords: {
                    disconnect: { id: keywordId },
                },
            },
        });
    },
};
