# 📋 Checklist de Deploy - Conecta Unifesspa

## ✅ Arquivos Criados/Modificados

- [x] `Dockerfile` - Build otimizado multi-stage
- [x] `.dockerignore` - Otimização do build
- [x] `compose.yaml` - Orquestração completa com app + PostgreSQL + pgAdmin
- [x] `.github/workflows/deploy.yml` - CI/CD automatizado
- [x] `docker-deploy.sh` - Script de gerenciamento
- [x] `DEPLOY.md` - Documentação completa
- [x] `.env.production` - Template de variáveis
- [x] `nginx.conf.example` - Configuração de proxy reverso
- [x] Health check no servidor (`/health`)
- [x] `.gitignore` atualizado
- [x] `README.md` atualizado

## 🔧 Configurações Necessárias no GitHub

Acesse: **Settings > Secrets and variables > Actions**

### Secrets SFTP
- [ ] `SFTP_HOST` - IP ou domínio do servidor
- [ ] `SFTP_USER` - Usuário SSH
- [ ] `SFTP_PASSWORD` - Senha SSH
- [ ] `SFTP_PORT` - Porta SSH (normalmente 22)
- [ ] `SFTP_TARGET` - Caminho no servidor (ex: /home/usuario/conecta-unifesspa)

### Secrets da Aplicação
- [ ] `DATABASE_URL` - postgresql://user:pass@postgres-db:5432/dbname
- [ ] `DB_USER` - Usuário do PostgreSQL
- [ ] `DB_PASSWORD` - Senha do PostgreSQL
- [ ] `DB_NAME` - Nome do banco
- [ ] `DB_PORT` - Porta do PostgreSQL (5432)
- [ ] `PORT` - Porta da aplicação (3333)
- [ ] `JWT_SECRET` - Chave secreta JWT

### Secrets opcionais
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `PGADMIN_DEFAULT_EMAIL`
- [ ] `PGADMIN_DEFAULT_PASSWORD`

## 🚀 Passos no Servidor Hostinger

### 1. Instalar Docker e Docker Compose
```bash
# Verificar se já está instalado
docker --version
docker compose version

# Se não estiver, instalar (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Configurar o projeto
```bash
# Criar diretório
mkdir -p ~/conecta-unifesspa
cd ~/conecta-unifesspa

# Clonar repositório (ou aguardar deploy automático)
git clone https://github.com/seu-usuario/conecta-unifesspa-backend.git .

# Criar arquivo .env
cp .env.production .env
nano .env  # Edite com suas configurações
```

### 3. Ajustar permissões
```bash
chmod +x docker-deploy.sh
chmod -R 755 api/uploads
```

### 4. Primeiro deploy
```bash
./docker-deploy.sh start

# Ou manualmente:
docker compose up -d --build
```

### 5. Verificar logs
```bash
./docker-deploy.sh logs
# ou
docker compose logs -f app
```

## 🔍 Verificações Pós-Deploy

- [ ] Containers estão rodando: `docker compose ps`
- [ ] API responde: `curl http://localhost:3333/health`
- [ ] Banco de dados conectado (health check retorna database: connected)
- [ ] Migrations executadas: `docker compose exec app npx prisma migrate status`
- [ ] Volumes persistentes criados: `docker volume ls`

## 🌐 Configurar Domínio (Opcional)

### Com Nginx
```bash
# Copiar configuração
sudo cp nginx.conf.example /etc/nginx/sites-available/conecta-unifesspa
sudo ln -s /etc/nginx/sites-available/conecta-unifesspa /etc/nginx/sites-enabled/

# Editar com seu domínio
sudo nano /etc/nginx/sites-available/conecta-unifesspa

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx

# Obter SSL com Certbot
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Monitoramento

### Verificar saúde
```bash
curl http://localhost:3333/health
```

### Ver uso de recursos
```bash
docker stats
```

### Backup automático (crontab)
```bash
# Adicionar ao crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * cd ~/conecta-unifesspa && ./docker-deploy.sh backup-db
```

## 🔄 Atualizações

### Automático (via GitHub)
- Apenas faça push para a branch `main`

### Manual
```bash
./docker-deploy.sh update
```

## 🆘 Troubleshooting

### Container não inicia
```bash
docker compose logs app
docker compose exec app env | grep DATABASE_URL
```

### Banco não conecta
```bash
docker compose logs postgres-db
docker compose exec app npx prisma migrate status
```

### Porta em uso
```bash
sudo lsof -i :3333
# ou mudar PORT no .env
```

### Limpar tudo e recomeçar
```bash
docker compose down -v
docker system prune -af
./docker-deploy.sh start
```

## 📞 Suporte

- Documentação: [DEPLOY.md](./DEPLOY.md)
- Script de ajuda: `./docker-deploy.sh`
- GitHub Issues: https://github.com/seu-usuario/conecta-unifesspa-backend/issues
