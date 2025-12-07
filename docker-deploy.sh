#!/bin/bash

# Script de gerenciamento do deploy Docker
# Use: ./docker-deploy.sh [comando]

set -e

COMPOSE_FILE="compose.yaml"

case "$1" in
  start)
    echo "🚀 Iniciando containers..."
    docker compose up -d
    echo "✅ Containers iniciados!"
    docker compose ps
    ;;
    
  stop)
    echo "🛑 Parando containers..."
    docker compose down
    echo "✅ Containers parados!"
    ;;
    
  restart)
    echo "🔄 Reiniciando containers..."
    docker compose restart
    echo "✅ Containers reiniciados!"
    ;;
    
  rebuild)
    echo "🔨 Reconstruindo e reiniciando containers..."
    docker compose down
    docker compose up -d --build
    echo "✅ Containers reconstruídos e iniciados!"
    docker compose ps
    ;;
    
  logs)
    echo "📋 Exibindo logs (Ctrl+C para sair)..."
    docker compose logs -f "${2:-app}"
    ;;
    
  status)
    echo "📊 Status dos containers:"
    docker compose ps
    ;;
    
  migrate)
    echo "🗄️  Executando migrations..."
    docker compose exec app npx prisma migrate deploy
    echo "✅ Migrations executadas!"
    ;;
    
  seed)
    echo "🌱 Executando seed..."
    docker compose exec app npm run seed
    echo "✅ Seed executado!"
    ;;
    
  shell)
    echo "🐚 Abrindo shell no container da aplicação..."
    docker compose exec app sh
    ;;
    
  db-shell)
    echo "🗄️  Abrindo shell do PostgreSQL..."
    docker compose exec postgres-db psql -U ${DB_USER:-postgres} -d ${DB_NAME:-conecta_unifesspa}
    ;;
    
  clean)
    echo "🧹 Limpando containers e volumes..."
    read -p "Isso vai remover TODOS os dados. Tem certeza? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      docker compose down -v
      docker system prune -af
      echo "✅ Limpeza concluída!"
    else
      echo "❌ Operação cancelada."
    fi
    ;;
    
  backup-db)
    echo "💾 Criando backup do banco de dados..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker compose exec -T postgres-db pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-conecta_unifesspa} > "$BACKUP_FILE"
    echo "✅ Backup criado: $BACKUP_FILE"
    ;;
    
  restore-db)
    if [ -z "$2" ]; then
      echo "❌ Uso: ./docker-deploy.sh restore-db <arquivo-backup.sql>"
      exit 1
    fi
    echo "📥 Restaurando banco de dados de $2..."
    docker compose exec -T postgres-db psql -U ${DB_USER:-postgres} ${DB_NAME:-conecta_unifesspa} < "$2"
    echo "✅ Banco de dados restaurado!"
    ;;
    
  update)
    echo "⬆️  Atualizando aplicação..."
    git pull origin main
    docker compose down
    docker compose up -d --build
    docker compose exec app npx prisma migrate deploy
    echo "✅ Aplicação atualizada!"
    docker compose ps
    ;;
    
  *)
    echo "📖 Uso: ./docker-deploy.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start       - Inicia os containers"
    echo "  stop        - Para os containers"
    echo "  restart     - Reinicia os containers"
    echo "  rebuild     - Reconstrói e reinicia os containers"
    echo "  logs [serviço] - Exibe logs (padrão: app)"
    echo "  status      - Mostra status dos containers"
    echo "  migrate     - Executa migrations do Prisma"
    echo "  seed        - Executa seed do banco de dados"
    echo "  shell       - Abre shell no container da aplicação"
    echo "  db-shell    - Abre shell do PostgreSQL"
    echo "  clean       - Remove todos os containers e volumes"
    echo "  backup-db   - Cria backup do banco de dados"
    echo "  restore-db <arquivo> - Restaura banco de dados"
    echo "  update      - Atualiza código e reconstrói containers"
    exit 1
    ;;
esac
