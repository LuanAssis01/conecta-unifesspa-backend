import { FastifyRequest, FastifyReply } from 'fastify';
import {
  userService,
  UserNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError
} from '../services/userService';
import {
  CreateUserSchema,
  LoginSchema,
  UpdateUserSchema,
  UserIdParamSchema
} from '../valueObjects/userValueObjects';
import { ZodError } from 'zod';

const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join(', ');
};

export const userController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = CreateUserSchema.parse(request.body);

      const user = await userService.create(validatedData);

      return reply.status(201).send({
        message: 'Usuário criado com sucesso',
        user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof EmailAlreadyExistsError) {
        return reply.status(400).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: 'Problema interno' });
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      const { user, token } = await userService.login(email, password);

      return reply.status(200).send({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof InvalidCredentialsError) {
        return reply.status(400).send({ error: error.message });
      }
      if (error instanceof UserNotFoundError) {
        return reply.status(401).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: 'Problema interno' });
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = UpdateUserSchema.parse(request.body);

      const { id: userIdFromToken } = request.user;

      const user = await userService.update(userIdFromToken, validatedData);

      return reply.status(200).send({
        message: 'Perfil atualizado com sucesso',
        user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof EmailAlreadyExistsError) {
        return reply.status(400).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar perfil' });
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAll();
      return reply.status(200).send(users);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar usuários' });
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = UserIdParamSchema.parse(request.params);

      await userService.delete(id);

      return reply.status(200).send({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: formatZodError(error) });
      }
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      console.error(error);
      return reply.status(500).send({ error: 'Erro ao deletar usuário' });
    }
  },
};