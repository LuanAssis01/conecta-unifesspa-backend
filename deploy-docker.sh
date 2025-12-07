#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Conecta Unifesspa..."

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "Instale com: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Verificar se docker compose está disponível
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está disponível!"
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    if [ -f .env.production ]; then
        echo "📝 Copiando .env.production para .env..."
        cp .env.production .env
    else
        echo "❌ Crie um arquivo .env com as configurações necessárias!"
        exit 1
    fi
fi

# Parar containers antigos
echo "🛑 Parando containers antigos..."
docker compose down 2>/dev/null || true

# Limpar imagens antigas (opcional, economiza espaço)
# Descomente a linha abaixo se quiser limpar imagens antigas
# docker system prune -af --volumes || true

# Build e start dos containers
echo "🔨 Construindo e iniciando containers..."
docker compose up -d --build

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 15

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker compose ps

# Verificar health
echo ""
echo "🏥 Verificando saúde da aplicação..."
sleep 5

if docker compose ps | grep -q "healthy"; then
    echo "✅ Containers saudáveis!"
else
    echo "⚠️  Alguns containers podem não estar saudáveis ainda. Verifique os logs."
fi

# Verificar logs
echo ""
echo "📋 Últimos logs da aplicação:"
docker compose logs --tail=30 app

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Acesse a aplicação em: http://localhost:${PORT:-3333}"
echo "🔍 Para ver logs em tempo real: docker compose logs -f app"
echo "📊 Para ver status: docker compose ps"
