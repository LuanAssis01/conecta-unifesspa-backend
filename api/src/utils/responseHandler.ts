import { FastifyReply } from 'fastify';

interface SuccessResponseData {
  message: string;
  data?: any;
}

interface ErrorResponseData {
  message: string;
  details?: string;
  status: number;
}

export class ResponseHandler {
  static success(reply: FastifyReply, statusCode: number, message: string, data?: any) {
    return reply.status(statusCode).send({
      success: true,
      message,
      ...(data && { data }),
    });
  }

  static error(reply: FastifyReply, statusCode: number, message: string, details?: string) {
    return reply.status(statusCode).send({
      success: false,
      message,
      error: {
        details: details || message,
        status: statusCode,
      },
    });
  }

  // Métodos auxiliares para códigos de status comuns
  static ok(reply: FastifyReply, message: string, data?: any) {
    return this.success(reply, 200, message, data);
  }

  static created(reply: FastifyReply, message: string, data?: any) {
    return this.success(reply, 201, message, data);
  }

  static badRequest(reply: FastifyReply, message: string, details?: string) {
    return this.error(reply, 400, message, details);
  }

  static unauthorized(reply: FastifyReply, message: string, details?: string) {
    return this.error(reply, 401, message, details);
  }

  static forbidden(reply: FastifyReply, message: string, details?: string) {
    return this.error(reply, 403, message, details);
  }

  static notFound(reply: FastifyReply, message: string, details?: string) {
    return this.error(reply, 404, message, details);
  }

  static conflict(reply: FastifyReply, message: string, details?: string) {
    return this.error(reply, 409, message, details);
  }

  static internalError(reply: FastifyReply, message: string = 'Erro interno do servidor', details?: string) {
    return this.error(reply, 500, message, details);
  }
}
