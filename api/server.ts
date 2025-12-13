import Fastify from 'fastify';
import { appRoutes } from './src/router/index';
import cors from "@fastify/cors";
import multipart from '@fastify/multipart';
import { prisma } from './src/lib/prisma';

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: "*",
});

server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // até 10 MB
});

// Health check endpoint
server.get('/health', async (_req, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return reply.send({ status: 'ok', database: 'connected' });
  } catch {
    return reply.status(503).send({ status: 'error', database: 'disconnected' });
  }
});

server.register(appRoutes);

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
