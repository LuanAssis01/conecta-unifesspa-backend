import { prisma } from '../lib/prisma';

interface CreateCourseDTO {
  name: string;
}

export const courseService = {
  async create(data: CreateCourseDTO) {
    const { name } = data;

    if (!name) {
      throw new Error('Nome é obrigatório');
    }

    const existingCourse = await prisma.course.findFirst({ where: { name } });

    if (existingCourse) {
      throw new Error('Curso já cadastrado');
    }

    const course = await prisma.course.create({ data: { name } });
    return course;
  },

  async getAll() {
    const courses = await prisma.course.findMany();
    return courses;
  },

  async getById(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    
    if (!course) {
      throw new Error('Curso não encontrado');
    }

    return course;
  },

  async delete(courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    
    if (!course) {
      throw new Error('Curso não encontrado');
    }

    await prisma.course.delete({ where: { id: courseId } });
  },
};
