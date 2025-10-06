import { FastifyRequest, FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: UserRole;
    };

    if (decoded.role !== UserRole.ADMIN) {
      return reply.status(403).send({ error: "Acesso negado. Apenas ADMIN." });
    }

    (request as any).user = decoded;

  } catch (err) {
    return reply.status(401).send({ error: "Token inválido" });
  }
}


