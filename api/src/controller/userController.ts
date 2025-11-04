import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService';
import { ResponseHandler } from '../utils/responseHandler';

export const userController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password } = request.body as {
        name: string;
        email: string;
        password: string;
      };

      const user = await userService.create({ name, email, password });

      return ResponseHandler.created(reply, 'Usuário criado com sucesso', { user });
    } catch (error: any) {
      console.error(error);

      if (error.message === 'E-mail já cadastrado') {
        return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
      }

      return ResponseHandler.internalError(reply, 'Erro ao criar usuário', error.message);
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const result = await userService.login({ email, password });

      return ResponseHandler.ok(reply, 'Login realizado com sucesso', result);
    } catch (error: any) {
      console.error(error);

      if (error.message === 'E-mail e senha são obrigatórios') {
        return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
      }

      if (error.message === 'E-mail ou senha inválidos') {
        return ResponseHandler.unauthorized(reply, 'Credenciais inválidas', error.message);
      }

      return ResponseHandler.internalError(reply, 'Erro ao realizar login', error.message);
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password } = request.body as {
        name?: string;
        email?: string;
        password?: string;
      };

      const { id: userIdFromToken } = request.user;

      const user = await userService.update(userIdFromToken, { name, email, password });

      return ResponseHandler.ok(reply, 'Usuário atualizado com sucesso', { user });
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Usuário não encontrado') {
        return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
      }

      if (error.message === 'E-mail já cadastrado') {
        return ResponseHandler.badRequest(reply, 'Requisição inválida', error.message);
      }

      return ResponseHandler.internalError(reply, 'Erro ao atualizar usuário', error.message);
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAll();

      return ResponseHandler.ok(reply, 'Usuários recuperados com sucesso', { users });
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.internalError(reply, 'Erro ao buscar usuários', error.message);
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      await userService.delete(id);

      return ResponseHandler.ok(reply, 'Usuário deletado com sucesso');
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Usuário não encontrado') {
        return ResponseHandler.notFound(reply, 'Recurso não encontrado', error.message);
      }

      return ResponseHandler.internalError(reply, 'Erro ao deletar usuário', error.message);
    }
  },
};
