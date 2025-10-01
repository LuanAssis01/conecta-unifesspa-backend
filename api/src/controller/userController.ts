import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

export const userController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password, role } = request.body as {
        name: string;
        email: string;
        password: string;
        role: UserRole; // enum do Prisma
      };

      // validação do enum
      if (!Object.values(UserRole).includes(role)) {
        return reply.status(400).send({ error: 'Invalid role' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      return reply.status(201).send({
        message: 'Usuário criado com sucesso',
        user,
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Problema interno' });
    }
  },




};

