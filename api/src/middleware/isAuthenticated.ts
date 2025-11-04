import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
}

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Token não fornecido" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return reply.status(401).send({
        error: "Formato de token inválido (esperado: Bearer <token>)",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as DecodedUser;

    (request as any).user = decoded;
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({ error: "Token inválido ou expirado." });
    }

    console.error("Erro no isAuthenticated:", err);
    return reply.status(500).send({ error: "Erro interno de autenticação." });
  }
}
