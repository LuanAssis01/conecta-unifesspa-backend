import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { appRoutes } from './src/router/index'
import { prisma } from './src/lib/prisma'

const server = Fastify({
  logger: true,
})

// CORS
server.register(cors, {
  origin: '*', // em prod você pode restringir
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

// multipart
server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 },
})

// Health check
server.get('/health', async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }
  } catch (error) {
    reply.status(503)
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    }
  }
})

// Rotas
server.register(appRoutes)

// 🔥 HANDLER SERVERLESS DA VERCEL
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // garante que plugins e rotas foram carregados
    await server.ready()

    // delega a request pro Fastify
    server.server.emit('request', req, res)
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}
