import { z } from "zod";

export const IndicatorSchema = z.object({
    title: z.string().min(1, "Título do indicador é obrigatório").max(200, "Título muito longo"),
    value: z.number().int("Valor deve ser um número inteiro").min(0, "Valor deve ser positivo"),
});

export const CreateIndicatorsSchema = z.object({
    indicators: z
        .array(IndicatorSchema)
        .min(1, "Envie pelo menos um indicador"),
});

export const UpdateIndicatorSchema = z
    .object({
        title: z.string().min(1, "Título do indicador é obrigatório").max(200, "Título muito longo").optional(),
        value: z.number().int("Valor deve ser um número inteiro").min(0, "Valor deve ser positivo").optional(),
    })
    .refine((data) => data.title !== undefined || data.value !== undefined, {
        message: "Pelo menos um campo deve ser informado para atualização",
    });

export const ProjectIdParamSchema = z.object({
    projectId: z.string().uuid("ID do projeto inválido"),
});

export const IndicatorIdParamSchema = z.object({
    indicatorId: z.string().uuid("ID do indicador inválido"),
});     