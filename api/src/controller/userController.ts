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
};