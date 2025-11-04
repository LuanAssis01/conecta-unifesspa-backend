  import Fastify from 'fastify';
  import { appRoutes } from './src/router/index';
  import multipart from '@fastify/multipart';
  import { prisma } from './src/lib/prisma';
  import { ensureBucketsExist } from './src/lib/minio';

  const server = Fastify({
    logger: false, // Desabilita logs do Fastify
  });

  server.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // até 10 MB
  });
  server.register(appRoutes);

  const start = async () => {
    try {
      // Inicializa os buckets do MinIO
      await ensureBucketsExist();
      
      const port = Number(process.env.PORT) || 3333;
      await server.listen({ port, host: "0.0.0.0" });
      console.log(`\n🚀 Server running on http://localhost:${port}\n`);
    } catch (err) {
      console.error('❌ Error starting server:', err);
      process.exit(1);
    }
  };

  start();

