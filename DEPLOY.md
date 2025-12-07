# Conecta Unifesspa - Deploy Docker

## Configuração na Hostinger

### 1. Pré-requisitos no servidor
Certifique-se de que Docker e Docker Compose estão instalados no servidor Hostinger:

```bash
# Verificar instalação
docker --version
docker compose version
```

### 2. Secrets necessários no GitHub
Configure os seguintes secrets no repositório (Settings > Secrets and variables > Actions):

- `SFTP_HOST`: Endereço do servidor Hostinger
- `SFTP_USER`: Usuário SSH
- `SFTP_PASSWORD`: Senha SSH
- `SFTP_PORT`: Porta SSH (geralmente 22)
- `SFTP_TARGET`: Caminho completo no servidor (ex: /home/usuario/app)
- `DATABASE_URL`: URL completa do banco de dados
- `DB_USER`: Usuário do PostgreSQL
- `DB_PASSWORD`: Senha do PostgreSQL
- `DB_NAME`: Nome do banco de dados
- `DB_PORT`: Porta do PostgreSQL (padrão: 5432)
- `PORT`: Porta da aplicação (padrão: 3333)
- `JWT_SECRET`: Chave secreta para JWT
- `PGADMIN_DEFAULT_EMAIL`: Email para acesso ao pgAdmin
- `PGADMIN_DEFAULT_PASSWORD`: Senha para acesso ao pgAdmin

### 3. Arquivo .env no servidor
Crie um arquivo `.env` no diretório do projeto no servidor com todas as variáveis necessárias.

### 4. Deploy manual
Para fazer deploy manual, conecte-se ao servidor via SSH:

```bash
ssh usuario@servidor

# Navegue até o diretório do projeto
cd /caminho/para/o/projeto

# Pare os containers
docker compose down

# Atualize o código (se necessário)
git pull origin main

# Reconstrua e inicie os containers
docker compose up -d --build

# Verifique os logs
docker compose logs -f app
```

### 5. Comandos úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f app

# Reiniciar apenas a aplicação
docker compose restart app

# Executar migrations manualmente
docker compose exec app npx prisma migrate deploy

# Acessar o banco de dados
docker compose exec postgres-db psql -U seu_usuario -d nome_do_banco

# Limpar volumes e dados (CUIDADO!)
docker compose down -v
```

### 6. Estrutura de portas
- Aplicação: 3333 (configurável via PORT)
- PostgreSQL: 5432 (configurável via DB_PORT)
- pgAdmin: 5050 (configurável via PGADMIN_PORT)

### 7. Volumes persistentes
Os dados são armazenados em volumes Docker nomeados:
- `postgres_data`: Dados do PostgreSQL
- `pgadmin_data`: Dados do pgAdmin
- `./api/uploads`: Arquivos enviados pela aplicação (mapeado para o host)

### 8. Troubleshooting

**Problema: Container não inicia**
```bash
docker compose logs app
```

**Problema: Banco de dados não conecta**
```bash
docker compose logs postgres-db
docker compose exec app env | grep DATABASE_URL
```

**Problema: Migrations não rodam**
```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma migrate status
```

**Problema: Sem espaço em disco**
```bash
docker system df
docker system prune -a --volumes
```
