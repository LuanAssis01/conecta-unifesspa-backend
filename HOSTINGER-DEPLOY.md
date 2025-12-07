# 🚀 Deploy Automático via SSH na Hostinger

## ✅ Solução Implementada

### Deploy 100% Automático via SSH
- ✅ GitHub Actions conecta via SSH
- ✅ Atualiza código via `git pull`
- ✅ Cria arquivo `.env` automaticamente
- ✅ Para containers antigos
- ✅ Reconstrói e inicia containers Docker
- ✅ Exibe logs e status

**Nenhuma ação manual necessária após configuração inicial!**

---

## 🔧 Configuração Inicial (fazer apenas uma vez)

### 1. Configurar Secrets no GitHub

Acesse: **Settings > Secrets and variables > Actions > New repository secret**

Configure os seguintes secrets:

#### Conexão SSH
- `SSH_HOST` - Endereço do servidor Hostinger
- `SSH_USER` - Usuário SSH
- `SSH_PASSWORD` - Senha SSH
- `SSH_PORT` - Porta SSH (geralmente `22`)
- `DEPLOY_PATH` - Caminho completo no servidor (ex: `/home/usuario/conecta-unifesspa-backend`)

#### Aplicação
- `DATABASE_URL` - `postgresql://postgres:senha@postgres-db:5432/conecta_unifesspa`
- `DB_USER` - `postgres`
- `DB_PASSWORD` - Senha segura do PostgreSQL
- `DB_NAME` - `conecta_unifesspa`
- `DB_PORT` - `5432`
- `PORT` - `3333`
- `JWT_SECRET` - Chave secreta JWT (gere uma aleatória)

#### Opcionais
- `PGADMIN_DEFAULT_EMAIL` - Email para pgAdmin
- `PGADMIN_DEFAULT_PASSWORD` - Senha para pgAdmin
- `PGADMIN_PORT` - `5050`

---

## 🚀 Configuração no Servidor Hostinger

### 1. Acessar o Terminal SSH (hPanel)
- Vá em: **Avançado** → **Terminal SSH** ou use um cliente SSH

### 2. Clonar o repositório (primeira vez apenas)
```bash
# Navegar para o diretório home
cd ~

# Clonar o repositório
git clone https://github.com/LuanAssis01/conecta-unifesspa-backend.git

# Entrar no diretório
cd conecta-unifesspa-backend
```

### 3. Verificar Docker
```bash
# Verificar se Docker está instalado
docker --version
docker compose version

# Se não estiver, instalar
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

### 4. Primeiro Deploy Manual
```bash
# Executar o script de deploy
chmod +x deploy-docker.sh
./deploy-docker.sh
```

---

## 🎯 Como Funciona o Deploy Automático

Após a configuração inicial:

1. **Você faz push** para a branch `main`
   ```bash
   git push origin main
   ```

2. **GitHub Actions automaticamente:**
   - ✅ Conecta no servidor via SSH
   - ✅ Faz `git pull` do código atualizado
   - ✅ Atualiza o arquivo `.env`
   - ✅ Para containers antigos
   - ✅ Reconstrói e inicia containers Docker
   - ✅ Exibe status e logs

3. **Aplicação atualizada!** 🎉

---

## 📊 Monitoramento

### Ver logs do último deploy
Acesse: **Actions** no GitHub e veja os logs detalhados

### Ver logs no servidor
```bash
ssh usuario@servidor
cd ~/conecta-unifesspa-backend
docker compose logs -f app
```

### Verificar status dos containers
```bash
docker compose ps
```

### Testar a API
```bash
curl http://localhost:3333/health
```

---

## 🔍 Troubleshooting

### Deploy falhou - Erro de conexão SSH
- Verifique se `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD` e `SSH_PORT` estão corretos
- Teste conexão manual: `ssh usuario@servidor -p 22`

### Deploy falhou - Git pull error
```bash
# No servidor, ajustar permissões
cd ~/conecta-unifesspa-backend
git config --global --add safe.directory $(pwd)
```

### Containers não iniciam
```bash
# Ver logs detalhados
docker compose logs app
docker compose logs postgres-db

# Verificar arquivo .env
cat .env
```

### Porta já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :3333

# Parar processo
sudo kill -9 PID
```

---

## 🆘 Comandos Úteis no Servidor

```bash
# Reiniciar apenas a aplicação
docker compose restart app

# Ver logs em tempo real
docker compose logs -f app

# Parar tudo
docker compose down

# Reconstruir do zero
docker compose down -v
docker compose up -d --build

# Limpar espaço em disco
docker system prune -af
```

---

## 📋 Passo a Passo no Servidor Hostinger

### Opção 1: Via Terminal da Hostinger (hPanel)

1. **Acesse o hPanel da Hostinger**
   - Vá em: `Avançado` → `Terminal SSH`

2. **Navegue até o diretório do projeto**
   ```bash
   cd caminho/para/conecta-unifesspa-backend
   ```

3. **Execute o script de deploy**
   ```bash
   ./deploy-docker.sh
   ```

### Opção 2: Via SSH tradicional (se disponível)

```bash
# Conectar ao servidor
ssh seu_usuario@seu_servidor

# Ir para o diretório
cd caminho/para/conecta-unifesspa-backend

# Executar deploy
./deploy-docker.sh
```

---

## 🔄 Automação Opcional

### Criar um Cron Job para deploy automático

1. **Acesse o hPanel** → `Avançado` → `Cron Jobs`

2. **Configure um cron job** que verifica mudanças a cada 5 minutos:
   ```bash
   */5 * * * * cd /caminho/para/conecta-unifesspa-backend && git pull origin main && ./deploy-docker.sh >> /tmp/deploy.log 2>&1
   ```

   Ou para executar apenas uma vez por dia (à meia-noite):
   ```bash
   0 0 * * * cd /caminho/para/conecta-unifesspa-backend && git pull origin main && ./deploy-docker.sh >> /tmp/deploy.log 2>&1
   ```

### Ou criar um webhook (mais avançado)

Crie um arquivo `webhook.php` no servidor:

```php
<?php
// webhook.php
$secret = 'sua_chave_secreta';
$payload = file_get_contents('php://input');
$headers = getallheaders();

// Validar webhook do GitHub
if (isset($headers['X-Hub-Signature-256'])) {
    $signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    
    if (hash_equals($signature, $headers['X-Hub-Signature-256'])) {
        // Executar deploy
        $output = shell_exec('cd /caminho/para/conecta-unifesspa-backend && ./deploy-docker.sh 2>&1');
        echo $output;
        http_response_code(200);
    } else {
        http_response_code(403);
        echo 'Signature mismatch';
    }
} else {
    http_response_code(400);
}
```

Configure no GitHub: `Settings` → `Webhooks` → `Add webhook`
- URL: `https://seu-dominio.com/webhook.php`
- Secret: sua_chave_secreta
- Events: Just the push event

---

## ✅ Verificações Pós-Deploy

Após executar `./deploy-docker.sh`, verifique:

```bash
# Status dos containers
docker compose ps

# Logs em tempo real
docker compose logs -f app

# Testar API
curl http://localhost:3333/health
```

---

## 🔧 Troubleshooting

### Script não executa
```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### Docker não está instalado
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

### Arquivo .env não existe
```bash
cp .env.production .env
nano .env  # Editar com suas configurações
```

### Containers não iniciam
```bash
docker compose logs app
docker compose logs postgres-db
```

---

## 📝 Fluxo Completo

```mermaid
graph LR
    A[Push to GitHub] --> B[GitHub Actions]
    B --> C[Upload via SFTP]
    C --> D[Arquivos no Servidor]
    D --> E[Você: ./deploy-docker.sh]
    E --> F[Containers Rodando]
```

1. **Você faz push** para a branch `main`
2. **GitHub Actions** faz upload dos arquivos via SFTP
3. **Você executa** `./deploy-docker.sh` no servidor (ou configura automação)
4. **Aplicação** fica online! 🎉

---

## 🆘 Precisa de Ajuda?

- Verifique os logs: `docker compose logs -f`
- Status dos containers: `docker compose ps`
- Reiniciar: `./docker-deploy.sh restart`
- Limpar tudo: `docker compose down -v && docker system prune -af`
