# 🔐 Secrets do GitHub - Guia de Configuração

## 📍 Onde Configurar
**GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

## 🔑 Secrets Obrigatórios

### Conexão SSH (Hostinger)
```
SSH_HOST
Valor: IP ou domínio do servidor Hostinger
Exemplo: 123.45.67.89 ou servidor.hostinger.com
```

```
SSH_USER
Valor: Seu usuário SSH da Hostinger
Exemplo: u123456789 ou seu_usuario
```

```
SSH_PASSWORD
Valor: Senha do SSH da Hostinger
```

```
SSH_PORT
Valor: 22
```

```
DEPLOY_PATH
Valor: Caminho completo no servidor onde está o projeto
Exemplo: /home/u123456789/conecta-unifesspa-backend
```

---

### Banco de Dados PostgreSQL

```
DATABASE_URL
Valor: postgresql://postgres:SUA_SENHA_AQUI@postgres-db:5432/conecta_unifesspa
```

```
DB_USER
Valor: postgres
```

```
DB_PASSWORD
Valor: SuaSenhaSeguraDoPostgreSQL123!
(use uma senha forte)
```

```
DB_NAME
Valor: conecta_unifesspa
```

```
DB_PORT
Valor: 5432
```

---

### Aplicação

```
PORT
Valor: 3333
```

```
JWT_SECRET
Valor: gere uma chave aleatória segura
Exemplo: 9f8d7a6s5d4f3g2h1j0k9l8m7n6b5v4c3x2z1
Dica: use este comando para gerar:
openssl rand -hex 32
```

---

### pgAdmin (Opcional)

```
PGADMIN_DEFAULT_EMAIL
Valor: admin@seudominio.com
```

```
PGADMIN_DEFAULT_PASSWORD
Valor: SenhaSeguraPgAdmin123!
```

```
PGADMIN_PORT
Valor: 5050
```

---

## 📋 Checklist de Configuração

- [ ] SSH_HOST configurado
- [ ] SSH_USER configurado
- [ ] SSH_PASSWORD configurado
- [ ] SSH_PORT = 22
- [ ] DEPLOY_PATH configurado
- [ ] DATABASE_URL configurado
- [ ] DB_USER = postgres
- [ ] DB_PASSWORD configurado (senha forte)
- [ ] DB_NAME = conecta_unifesspa
- [ ] DB_PORT = 5432
- [ ] PORT = 3333
- [ ] JWT_SECRET configurado (chave aleatória)
- [ ] PGADMIN_DEFAULT_EMAIL configurado (opcional)
- [ ] PGADMIN_DEFAULT_PASSWORD configurado (opcional)
- [ ] PGADMIN_PORT = 5050 (opcional)

---

## 🔍 Como Encontrar Informações da Hostinger

### SSH Host
1. Acesse o **hPanel**
2. Vá em **Avançado** → **Informações da Conta**
3. Procure por "Endereço do Servidor" ou "Server IP"

### SSH User e Password
1. Use as mesmas credenciais do hPanel
2. Ou crie um usuário SSH específico em **Avançado** → **SSH Access**

### DEPLOY_PATH
1. Conecte via SSH: `ssh seu_usuario@servidor -p 22`
2. Execute: `pwd` (mostra o diretório atual, ex: /home/u123456789)
3. O caminho completo será: `/home/seu_usuario/conecta-unifesspa-backend`

---

## ✅ Testar Configuração

Depois de configurar todos os secrets:

1. Faça um commit qualquer:
   ```bash
   git commit --allow-empty -m "test: trigger deploy"
   git push origin main
   ```

2. Vá em **Actions** no GitHub e acompanhe o deploy

3. Se der erro, verifique os logs e ajuste os secrets conforme necessário

---

## 🛡️ Segurança

- ✅ Nunca commite arquivos `.env` com senhas
- ✅ Use senhas fortes para produção
- ✅ Gere JWT_SECRET aleatório
- ✅ Não compartilhe os secrets
- ✅ Revogue secrets se compromometidos

---

## 🔄 Atualizar um Secret

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique no secret que deseja atualizar
3. Clique em **Update**
4. Digite o novo valor
5. Clique em **Update secret**
