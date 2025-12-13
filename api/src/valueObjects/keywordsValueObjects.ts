import { z } from "zod";

export const KeywordNameSchema = z
    .string()
    .min(1, "Nome da palavra-chave é obrigatório")
    .max(100, "Nome da palavra-chave muito longo");

export const CreateKeywordsSchema = z.object({
    keywords: z
        .array(z.string().min(1, "Nome da palavra-chave não pode ser vazio"))
        .min(1, "Pelo menos uma palavra-chave é obrigatória"),
});

export const ProjectIdParamSchema = z.object({
    projectId: z.string().uuid("ID do projeto inválido"),
});

export const KeywordIdParamSchema = z.object({
    keywordId: z.string().uuid("ID da palavra-chave inválido"),
});

export const ProjectKeywordParamsSchema = z.object({
    projectId: z.string().uuid("ID do projeto inválido"),
    keywordId: z.string().uuid("ID da palavra-chave inválido"),
});     