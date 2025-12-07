# 🧩 Conecta UNIFESSPA - Backend

API desenvolvida em **Node.js + TypeScript + Fastify + Prisma** para o projeto **Conecta UNIFESSPA**, uma plataforma que gerencia **projetos acadêmicos e de extensão** com controle de usuários, cursos, indicadores de impacto e integração com **Cloudinary** para upload de imagens.

---

## 📚 Tecnologias Utilizadas

- **Node.js** (v20+)
- **Fastify** – framework HTTP rápido e leve
- **TypeScript** – tipagem estática
- **Prisma ORM** – acesso ao banco de dados PostgreSQL
- **PostgreSQL** – banco de dados relacional
- **JWT (jsonwebtoken)** – autenticação segura
- **Bcrypt** – hash de senhas
- **Fastify Multer** – upload de arquivos
- **Cloudinary** – armazenamento de imagens na nuvem
- **Docker & Docker Compose** – ambiente containerizado

---

## 🐳 Deploy com Docker (Produção - Hostinger)

### Deploy Automático via GitHub Actions

1. Configure os secrets no GitHub (Settings > Secrets and variables > Actions):
   - `SFTP_HOST`, `SFTP_USER`, `SFTP_PASSWORD`, `SFTP_PORT`, `SFTP_TARGET`
   - Variáveis de ambiente: `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`, etc.

2. Push para a branch `main` dispara o deploy automaticamente

### Deploy Manual no Servidor

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/conecta-unifesspa-backend.git
cd conecta-unifesspa-backend

# Copiar e configurar variáveis de ambiente
cp .env.production .env
# Edite o .env com seus valores

# Iniciar com Docker Compose
./docker-deploy.sh start

# Ou manualmente:
docker compose up -d --build
```

### Comandos úteis de gerenciamento

```bash
./docker-deploy.sh start      # Inicia os containers
./docker-deploy.sh stop       # Para os containers
./docker-deploy.sh restart    # Reinicia os containers
./docker-deploy.sh rebuild    # Reconstrói e reinicia
./docker-deploy.sh logs       # Ver logs da aplicação
./docker-deploy.sh status     # Status dos containers
./docker-deploy.sh migrate    # Executa migrations
./docker-deploy.sh backup-db  # Backup do banco
./docker-deploy.sh update     # Atualiza do git e reconstrói
```

📖 Veja mais detalhes em [DEPLOY.md](./DEPLOY.md)

---

## ⚙️ Estrutura do Projeto

api/
├── src/
│ ├── auth/
│ │ └── jwt.ts
│ ├── controller/
│ │ ├── userController.ts
│ │ ├── projectController.ts
│ │ ├── courseController.ts
│ │ ├── keywordsController.ts
│ │ └── impactIndicatorsController.ts
│ ├── lib/
│ │ └── prisma.ts
│ ├── middleware/
│ │ ├── adminOnly.ts
│ │ └── uploadImage.ts
│ ├── router/
│ │ ├── userRouter.ts
│ │ ├── projectRouter.ts
│ │ ├── courseRouter.ts
│ │ ├── keywordsRouter.ts
│ │ └── impactIndicatorsRouter.ts
│ └── server.ts
├── prisma/
│ └── schema.prisma
├── .env
├── package.json
└── tsconfig.json


---

## 🚀 Como Rodar o Projeto Localmente

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-usuario/conecta-unifesspa-backend.git
cd conecta-unifesspa-backend

2️⃣ Instalar as dependências

npm install

3️⃣ Configurar o banco de dados (PostgreSQL)

Você pode usar um banco local ou Docker.
🧱 Opção 1: PostgreSQL Local

Crie um banco no PostgreSQL:

CREATE DATABASE conecta_unifesspa;

🐳 Opção 2: PostgreSQL via Docker

docker run --name conecta-unifesspa-db -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=postgres -e POSTGRES_DB=conecta_unifesspa -p 5432:5432 -d postgres

4️⃣ Criar o arquivo .env

Crie o arquivo .env na pasta api/ com o seguinte conteúdo:

# DATABASE
DATABASE_URL="postgresql://postgres:admin@localhost:5432/conecta_unifesspa?schema=public"

# JWT
JWT_SECRET="seuSegredoJWTsuperSeguro"

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# PORTA DO SERVIDOR
PORT=3333

    💡 Dica: obtenha suas credenciais do Cloudinary em https://cloudinary.com

5️⃣ Executar as migrações Prisma

npx prisma migrate dev --name init

6️⃣ Gerar o cliente Prisma

npx prisma generate

7️⃣ Rodar o servidor em modo desenvolvimento

npm run dev

O servidor iniciará em:

👉 http://localhost:3333
🔐 Autenticação JWT

O projeto usa JWT (JSON Web Token) para autenticação.

    Ao criar um usuário (rota /user), a senha é criptografada com bcrypt.

    No login (/login), o backend retorna um token JWT.

    Use o token nas rotas protegidas:

Authorization: Bearer seu_token_jwt

☁️ Upload de Imagens (Cloudinary)

As imagens são enviadas via Fastify Multer e salvas no Cloudinary.
A URL pública é retornada no campo img_url.

Exemplo de envio com curl:

curl -X POST http://localhost:3333/projects \
  -H "Authorization: Bearer <seu_token>" \
  -F "name=Projeto de Extensão" \
  -F "start_date=2025-10-05" \
  -F "duration=2026-01-05" \
  -F "numberVacancies=10" \
  -F "status=ACTIVE" \
  -F "audience=INTERNAL" \
  -F "image=@/caminho/da/imagem.png"

📦 Rotas Principais
👤 Usuários (/user)
Método	Rota	Descrição
POST	/user	Cria um novo usuário
POST	/login	Faz login e retorna token JWT
📁 Projetos (/projects)
Método	Rota	Descrição
POST	/projects	Cria novo projeto (com upload de imagem)
GET	/projects	Lista todos os projetos
GET	/projects/:id	Busca um projeto por ID
PUT	/projects/:id	Atualiza um projeto existente
DELETE	/projects/:id	Remove um projeto
🎓 Cursos (/courses)
Método	Rota	Descrição
POST	/courses	Cria um novo curso
GET	/courses	Lista todos os cursos
🔑 Palavras-chave (/keywords)
Método	Rota	Descrição
POST	/keywords	Cria palavra-chave
GET	/keywords	Lista todas
📊 Indicadores de Impacto (/impact-indicators)
Método	Rota	Descrição
POST	/impact-indicators	Cria novo indicador
GET	/impact-indicators	Lista todos
🧩 Middlewares

    adminOnly.ts → restringe acesso a rotas apenas para usuários ADMIN.

    uploadImage.ts → faz upload e envia imagens para o Cloudinary.

🧰 Comandos Úteis
Comando	Descrição
npm run dev	Inicia o servidor em modo desenvolvimento
npx prisma studio	Abre o painel visual do Prisma (http://localhost:5555
)
npx prisma migrate dev	Executa as migrações no banco
npx prisma generate	Gera novamente o cliente Prisma
🧑‍💻 Equipe
Nome	Função
Luan	Backend Developer
(adicione os colegas aqui)	...
🧾 Licença

Este projeto é distribuído sob a licença MIT.
Sinta-se livre para usar, modificar e contribuir! ❤️

Conecta UNIFESSPA — conectando universidade, comunidade e inovação 🚀


---

Quer que eu adicione uma seção extra no README explicando como **fazer deploy (ex: Railway, Render ou Docker Compose)** também? Isso ajuda muito na entrega final do projeto.


