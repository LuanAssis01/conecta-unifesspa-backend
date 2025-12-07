# 🚀 Como Executar o Deploy na Hostinger

## Problema Identificado
O GitHub Actions não consegue executar comandos SSH diretamente na Hostinger devido a restrições de conexão. A solução é fazer o upload dos arquivos via SFTP e executar o deploy manualmente no servidor.

## Solução Implementada

### 1️⃣ O GitHub Actions faz:
- ✅ Upload de todos os arquivos via SFTP
- ✅ Cria o script `deploy-docker.sh` automaticamente
- ✅ Envia o arquivo `.env` com as variáveis configuradas

### 2️⃣ Você precisa fazer no servidor:
Executar o script de deploy manualmente (apenas uma vez após cada push)

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
