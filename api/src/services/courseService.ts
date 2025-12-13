import { prisma } from "../lib/prisma";
import { Course, CreateCourseInput } from "../types/courseTypes";

export class CourseNotFoundError extends Error {
    constructor() {
        super("Curso não encontrado");
        this.name = "CourseNotFoundError";
    }
}

export class CourseAlreadyExistsError extends Error {
    constructor() {
        super("Já existe um curso com esse nome");
        this.name = "CourseAlreadyExistsError";
    }
}

export const courseService = {
    async create(data: CreateCourseInput): Promise<Course> {
        const existingCourse = await prisma.course.findFirst({
            where: { name: data.name },
        });

        if (existingCourse) {
            throw new CourseAlreadyExistsError();
        }

        return prisma.course.create({
            data: { name: data.name },
        });
    },

    async getAll(): Promise<Course[]> {
        return prisma.course.findMany({
            orderBy: { name: "asc" },
        });
    },

    async getById(id: string): Promise<Course> {
        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new CourseNotFoundError();
        }

        return course;
    },

    async delete(id: string): Promise<void> {
        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new CourseNotFoundError();
        }

        await prisma.course.delete({
            where: { id },
        });
    },
};
