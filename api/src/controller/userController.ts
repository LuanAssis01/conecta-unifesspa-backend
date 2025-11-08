import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../auth/jwt'

export const userController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password } = request.body as {
        name: string;
        email: string;
        password: string;
      };

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email já está em uso' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.TEACHER
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return reply.status(201).send({
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Problema interno' });
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return reply.status(400).send({
        message: 'Email e senha são obrigatórios',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({ error: 'Usuário não encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Senha incorreta' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password } = request.body as {
        name?: string;
        email?: string;
        password?: string;
      };

      const { id: userIdFromToken } = request.user;

      const existingUser = await prisma.user.findUnique({ where: { id: userIdFromToken } });
      if (!existingUser) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      let hashedPassword = existingUser.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Evita duplicidade de e-mail
      if (email && email !== existingUser.email) {
        const emailInUse = await prisma.user.findUnique({ where: { email } });
        if (emailInUse) {
          return reply.status(400).send({ error: 'Email já está em uso' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userIdFromToken },
        data: {
          name: name ?? existingUser.name,
          email: email ?? existingUser.email,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      return reply.status(200).send({
        message: 'Perfil atualizado com sucesso',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar perfil' });
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        },
      });

      return reply.status(200).send(users);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar usuários' });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      await prisma.user.delete({ where: { id } });

      return reply.status(200).send({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao deletar usuário' });
    }
  },
};