import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { prisma } from "./src/lib/prisma";
import { appRoutes } from "./src/router/index";

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: "*",
});

server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 },
});

server.get("/health", async (_req, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "connected" };
  } catch {
    reply.status(503);
    return { status: "error", database: "disconnected" };
  }
});

server.register(appRoutes);

export default async function handler(req: any, res: any) {
  await server.ready();
  server.server.emit("request", req, res);
}
