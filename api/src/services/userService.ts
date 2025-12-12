import { prisma } from "../lib/prisma";
import { generateToken } from "../auth/jwt";
import bcrypt from "bcrypt";
import {
    User,
    UserRole,
    UserWithoutPassword,
    UserPublic,
    CreateUserInput,
    UpdateUserInput,
    LoginResult,
} from "../types/userTypes";

const SALT_ROUNDS = 10;
const DEFAULT_ROLE: UserRole = "TEACHER";

export class UserNotFoundError extends Error {
    constructor(message = "Usuário não encontrado") {
        super(message);
        this.name = "UserNotFoundError";
    }
}

export class EmailAlreadyExistsError extends Error {
    constructor(message = "Email já está em uso") {
        super(message);
        this.name = "EmailAlreadyExistsError";
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message = "Credenciais inválidas") {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

const excludePassword = (user: User): UserWithoutPassword => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const userService = {
    async create(data: CreateUserInput): Promise<UserWithoutPassword> {
        const { name, email, password } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new EmailAlreadyExistsError();
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: DEFAULT_ROLE,
            },
        });

        return excludePassword(user as User);
    },

    async login(email: string, password: string): Promise<LoginResult> {
        if (!email || !password) {
            throw new InvalidCredentialsError("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new UserNotFoundError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError("Senha incorreta");
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
        });

        return {
            user: excludePassword(user as User),
            token,
        };
    },

    async update(userId: string, data: UpdateUserInput): Promise<UserWithoutPassword> {
        const { name, email, password } = data;

        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            throw new UserNotFoundError();
        }

        if (email && email !== existingUser.email) {
            const emailInUse = await prisma.user.findUnique({ where: { email } });
            if (emailInUse) {
                throw new EmailAlreadyExistsError();
            }
        }

        const hashedPassword = password
            ? await bcrypt.hash(password, SALT_ROUNDS)
            : existingUser.password;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name ?? existingUser.name,
                email: email ?? existingUser.email,
                password: hashedPassword,
            },
        });

        return excludePassword(updatedUser as User);
    },

    async updateRole(userId: string, newRole: UserRole): Promise<UserWithoutPassword> {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            throw new UserNotFoundError();
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        return excludePassword(user as User);
    },

    async getAll(): Promise<UserPublic[]> {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return users as UserPublic[];
    },

    async getById(userId: string): Promise<UserWithoutPassword> {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new UserNotFoundError();
        }

        return excludePassword(user as User);
    },

    async delete(userId: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new UserNotFoundError();
        }

        await prisma.user.delete({ where: { id: userId } });
    },
};  