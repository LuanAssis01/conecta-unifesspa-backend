import Fastify from 'fastify'
import cors from '@fastify/cors'
import { appRoutes } from './src/router/index'
import multipart from '@fastify/multipart'
import { prisma } from './src/lib/prisma'

const server = Fastify({
  logger: true,
})

// CORS – ajuste o origin pro endereço do seu frontend
server.register(cors, {
  origin: 'http://localhost:5173', // ou true em dev para liberar tudo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

// multipart
server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 },
})

// Health check route
server.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    }
  } catch (error) {
    reply.status(503)
    return { 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    }
  }
})

// suas rotas
server.register(appRoutes)

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server ready at http://localhost:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
