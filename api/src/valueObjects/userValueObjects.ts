import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['ADMIN', 'TEACHER']),
});

export const CreateUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export const UpdateUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
    email: z.string().email('Email inválido').optional(),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
}).refine(data => data.name || data.email || data.password, {
    message: 'Pelo menos um campo deve ser informado para atualização',
});

export const UserIdParamSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const UpdateRoleSchema = z.object({
    role: z.enum(['ADMIN', 'TEACHER'], {
        message: 'Role deve ser ADMIN ou TEACHER',
    }),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
