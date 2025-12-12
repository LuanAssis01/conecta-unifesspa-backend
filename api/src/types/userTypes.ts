export type UserRole = 'ADMIN' | 'TEACHER';

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
};

export type UserWithoutPassword = Omit<User, 'password'>;

export type UserPublic = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
}

export interface LoginResult {
    user: UserWithoutPassword;
    token: string;
}

export interface TokenPayload {
    id: string;
    email: string;
    role: UserRole;
}