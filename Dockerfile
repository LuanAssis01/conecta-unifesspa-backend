# Production stage - TypeScript direto com tsx
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache wget

# Copiar arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo tsx)
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte TypeScript
COPY api ./api
COPY tsconfig.json ./

EXPOSE 3333
CMD ["npm", "run", "start"]
