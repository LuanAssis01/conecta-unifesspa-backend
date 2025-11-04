# 🧩 Conecta UNIFESSPA - Backend

[![](https://img.shields.io/badge/Node.js-20%2B-blue?logo=node.js&style=for-the-badge)](https://nodejs.org/en/)
[![](https://img.shields.io/badge/Fastify-5.x-black?logo=fastify&style=for-the-badge)](https://fastify.io/)
[![](https://img.shields.io/badge/Prisma-6.x-blueviolet?logo=prisma&style=for-the-badge)](https://www.prisma.io/)
[![](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![](https://img.shields.io/badge/PostgreSQL-16-darkblue?logo=postgresql&style=for-the-badge)](https://www.postgresql.org/)
[![](https://img.shields.io/badge/MinIO-latest-red?logo=minio&style=for-the-badge)](https://min.io/)

API desenvolvida em **Node.js + TypeScript + Fastify + Prisma** para o projeto **Conecta UNIFESSPA**, uma plataforma que gerencia **projetos acadêmicos e de extensão** com controle de usuários, cursos, indicadores de impacto e integração com **MinIO** para armazenamento de arquivos.

---

## 🚀 Quick Start com Docker

A forma mais rápida de rodar o projeto completo:

```bash
# Inicia todos os serviços (PostgreSQL + MinIO + API)
./docker.sh start

# OU para desenvolvimento local (apenas infraestrutura)
./docker.sh dev
npm run dev
```

**URLs de acesso:**
- 🌐 API: http://localhost:3333
- 📦 MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
- 🐘 PostgreSQL: localhost:5432

📖 [Ver documentação completa do Docker](docs/DOCKER.md)

---

## ✨ Features

* **Autenticação JWT:** Sistema completo de registro e login com tokens JWT seguros.
* **Gerenciamento de Usuários:** Criação de usuários com senhas criptografadas (Bcrypt).
* **CRUD de Projetos:** Gerenciamento completo de projetos acadêmicos e de extensão.
* **Gestão Acadêmica:** CRUDs para Cursos, Palavras-chave e Indicadores de Impacto.
* **Upload de Arquivos:** Integração com MinIO para armazenamento de imagens e PDFs.
* **Controle de Acesso:** Middleware para restringir rotas apenas para administradores.

## 📚 Tecnologias Utilizadas

* **Node.js** (v20+)
* **Fastify** – framework HTTP rápido e leve
* **TypeScript** – tipagem estática
* **Prisma ORM** – acesso ao banco de dados PostgreSQL
* **PostgreSQL** – banco de dados relacional
* **MinIO** – object storage para arquivos
* **JWT (jsonwebtoken)** – autenticação segura
* **Bcrypt** – hash de senhas
* **Fastify Multer** – upload de arquivos
* **Cloudinary** – armazenamento de imagens na nuvem
* **Docker** – ambiente de desenvolvimento containerizado

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos

Antes de começar, você precisa ter as seguintes ferramentas instaladas:
* [Node.js (v18 ou superior)](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/install/)
* [Git](https://git-scm.com/)

### 2. Clonar o Repositório

git clone [https://github.com/seu-usuario/conecta-unifesspa-backend.git](https://github.com/seu-usuario/conecta-unifesspa-backend.git)
cd conecta-unifesspa-backend


### 3. Configurar Variáveis de Ambiente

Crie o arquivo .env a partir do exemplo. (Assumindo que está na pasta api/ ou na raiz do projeto, ajuste o caminho se necessário).
Bash

#### Se o .env-example está na raiz
cp env-example .env

Abra o arquivo .env e preencha as variáveis. Elas são essenciais para o funcionamento do banco de dados, autenticação e upload.


### 4. Iniciar o Banco de Dados (Docker)

Com o Docker em execução, suba o container do PostgreSQL:
Bash

docker-compose up -d

(O -d executa em modo "detached", liberando o terminal)

### 5. Instalar as Dependências

Bash

npm install

### 6. Executar as Migrações do Prisma

Este comando irá criar as tabelas no seu banco de dados com base no schema.prisma.
Bash

npx prisma migrate dev

### 7. Iniciar o Servidor

Bash

npm run dev

O servidor iniciará em: 👉 http://localhost:3333

📦 Rotas Principais (API Endpoints)

🔐 Autenticação e Usuários

Método	Rota	Descrição	Protegida
POST	/user	Cria um novo usuário (aluno, professor, etc.)	Não
POST	/login	Autentica um usuário e retorna um token JWT.	Não

📁 Projetos

Método	Rota	Descrição	Protegida
POST	/projects	Cria um novo projeto (com upload de imagem).	Sim
GET	/projects	Lista todos os projetos.	Não
GET	/projects/:id	Busca um projeto específico por ID.	Não
PUT	/projects/:id	Atualiza um projeto (requer permissão).	Sim
DELETE	/projects/:id	Remove um projeto (requer permissão).	Sim (Admin)

🎓 Cursos

Método	Rota	Descrição	Protegida
POST	/courses	Cria um novo curso.	Sim (Admin)
GET	/courses	Lista todos os cursos.	Não

🔑 Palavras-chave

Método	Rota	Descrição	Protegida
POST	/keywords	Cria uma nova palavra-chave.	Sim (Admin)
GET	/keywords	Lista todas as palavras-chave.	Não

📊 Indicadores de Impacto

Método	Rota	Descrição	Protegida
POST	/impact-indicators	Cria um novo indicador.	Sim (Admin)
GET	/impact-indicators	Lista todos os indicadores.	Não