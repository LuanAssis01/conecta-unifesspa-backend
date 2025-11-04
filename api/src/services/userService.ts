import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../auth/jwt';

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}

export const userService = {
  async create(data: CreateUserDTO) {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.TEACHER,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(data: LoginDTO) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('E-mail ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('E-mail ou senha inválidos');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  },

  async update(userId: string, data: UpdateUserDTO) {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Evita duplicidade de e-mail
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });
      if (emailInUse) {
        throw new Error('E-mail já cadastrado');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? existingUser.name,
        email: email ?? existingUser.email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async getAll() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return users;
  },

  async delete(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await prisma.user.delete({ where: { id: userId } });
  },
};
