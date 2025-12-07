# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package files para aproveitar cache do Docker
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar wget para health check
RUN apk add --no-cache wget

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar arquivos necessários do builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY . .

# Criar diretórios para uploads
RUN mkdir -p api/uploads/project-photos api/uploads/proposals

# Expor porta da aplicação
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
