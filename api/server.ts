  import Fastify from 'fastify';
  import { appRoutes } from './src/router/index';
  import multipart from '@fastify/multipart';
  import { prisma } from './src/lib/prisma';

  const server = Fastify({
    logger: true,
  });

  server.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // até 10 MB
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

