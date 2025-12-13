import { z } from 'zod';

const ProjectStatusEnum = z.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'FINISHED']);
const AudienceEnumSchema = z.enum(['INTERNAL', 'EXTERNAL']);

export const ProjectSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Nome do projeto é obrigatório').max(200, 'Nome do projeto muito longo'),
    subtitle: z.string().max(300, 'Subtítulo muito longo').nullable().optional(),
    overview: z.string().max(2000, 'Overview muito longo').nullable().optional(),
    description: z.string().max(5000, 'Descrição muito longa').nullable().optional(),
    expected_results: z.string().max(2000, 'Resultados esperados muito longo').nullable().optional(),
    start_date: z.coerce.date(),
    duration: z.number().int().positive('Duração deve ser positiva'),
    proposal_document_url: z.string().url().nullable().optional(),
    img_url: z.string().url().nullable().optional(),
    registration_form_url: z.string().url().nullable().optional(),
    numberVacancies: z.number().int().positive('Número de vagas deve ser positivo'),
    status: ProjectStatusEnum,
    audience: AudienceEnumSchema,
    courseId: z.string().uuid().nullable().optional(),
    creatorId: z.string().uuid().nullable().optional(),
});

export const CreateProjectSchema = z.object({
    name: z.string().min(1, 'Nome do projeto é obrigatório').max(200, 'Nome do projeto muito longo'),
    description: z.string().min(1, 'Descrição é obrigatória').max(5000, 'Descrição muito longa'),
    expected_results: z.string().min(1, 'Resultados esperados é obrigatório').max(2000, 'Resultados esperados muito longo'),
    start_date: z.coerce.date().catch(() => new Date()).refine(date => !isNaN(date.getTime()), 'Data de início inválida'),
    duration: z.coerce.number().int().positive('Duração deve ser um número positivo'),
    numberVacancies: z.coerce.number().int().positive('Número de vagas deve ser positivo'),
    audience: AudienceEnumSchema,
    courseId: z.string().uuid('ID do curso inválido'),
});

export const UpdateProjectSchema = z.object({
    name: z.string().min(1, 'Nome do projeto é obrigatório').max(200, 'Nome do projeto muito longo').optional(),
    description: z.string().max(5000, 'Descrição muito longa').optional(),
    expected_results: z.string().max(2000, 'Resultados esperados muito longo').optional(),
    start_date: z.coerce.date().optional(),
    duration: z.coerce.number().int().positive('Duração deve ser positiva').optional(),
    numberVacancies: z.coerce.number().int().positive('Número de vagas deve ser positivo').optional(),
    audience: AudienceEnumSchema.optional(),
    subtitle: z.string().max(300, 'Subtítulo muito longo').optional(),
    overview: z.string().max(2000, 'Overview muito longo').optional(),
    registration_form_url: z.string().url('URL do formulário inválida').optional(),
    status: ProjectStatusEnum.optional(),
}).refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Pelo menos um campo deve ser informado para atualização',
});

export const ProjectIdParamSchema = z.object({
    id: z.string().uuid('ID do projeto inválido'),
});

export const ProjectFiltersSchema = z.object({
    keywords: z.string().optional(),
    course: z.string().uuid('ID do curso inválido').optional(),
    status: ProjectStatusEnum.optional(),
    search: z.string().max(100, 'Termo de busca muito longo').optional(),
});

export const UpdateStatusSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
        message: 'Status deve ser APPROVED ou REJECTED',
    }),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectIdParam = z.infer<typeof ProjectIdParamSchema>;
export type ProjectFilters = z.infer<typeof ProjectFiltersSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;      