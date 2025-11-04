# ===========================================
# Production Image
# ===========================================
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta da aplicação
EXPOSE 3333

# Comando para rodar migrations e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx api/server.ts"]
