import { z } from "zod";

export const CreateCourseSchema = z.object({
    name: z
        .string()
        .min(1, "Nome do curso é obrigatório")
        .max(200, "Nome do curso muito longo"),
});

export const UpdateCourseSchema = z.object({
    name: z
        .string()
        .min(1, "Nome do curso é obrigatório")
        .max(200, "Nome do curso muito longo")
        .optional(),
});

export const CourseIdParamSchema = z.object({
    id: z.string().uuid("ID do curso inválido"),
});