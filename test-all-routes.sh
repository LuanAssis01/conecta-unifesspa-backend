#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
TOKEN=""
ADMIN_TOKEN=""

echo "========================================="
echo "    TESTANDO TODAS AS ROTAS DA API"
echo "========================================="
echo ""

# Função para fazer requisições
test_route() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    local content_type=${6:-"application/json"}
    
    echo -e "${YELLOW}[${method}]${NC} ${endpoint}"
    echo "Descrição: ${description}"
    
    if [ -n "$token" ]; then
        if [ "$content_type" = "multipart/form-data" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X ${method} "${API_URL}${endpoint}" \
                -H "Authorization: Bearer ${token}" \
                ${data})
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X ${method} "${API_URL}${endpoint}" \
                -H "Authorization: Bearer ${token}" \
                -H "Content-Type: ${content_type}" \
                ${data})
        fi
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X ${method} "${API_URL}${endpoint}" \
            -H "Content-Type: ${content_type}" \
            ${data})
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d')
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "${GREEN}✓ Status: ${http_code}${NC}"
    else
        echo -e "${RED}✗ Status: ${http_code}${NC}"
    fi
    
    echo "Resposta: $(echo $body | head -c 200)"
    echo ""
    echo "---"
    echo ""
}

# 1. HEALTH CHECK
echo "========================================="
echo "1. HEALTH CHECK"
echo "========================================="
test_route "GET" "/health" "Verifica saúde da API"

# 2. AUTENTICAÇÃO E USUÁRIOS
echo "========================================="
echo "2. AUTENTICAÇÃO E USUÁRIOS"
echo "========================================="

# Login (assumindo que existe um usuário admin no banco)
echo "Tentando fazer login como admin..."
login_response=$(curl -s -X POST "${API_URL}/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@unifesspa.edu.br","password":"admin123"}')

ADMIN_TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✓ Login como admin bem-sucedido!${NC}"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
    echo ""
else
    echo -e "${RED}✗ Falha no login. Algumas rotas protegidas não serão testadas.${NC}"
    echo "Resposta: $login_response"
    echo ""
fi

test_route "POST" "/login" "Login de usuário" \
    '-d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"'

test_route "GET" "/users" "Listar todos os usuários (ADMIN)" "" "$ADMIN_TOKEN"

test_route "POST" "/user" "Criar novo usuário (ADMIN)" \
    '-d "{\"name\":\"Test User\",\"email\":\"newuser@test.com\",\"password\":\"password123\",\"role\":\"TEACHER\"}"' \
    "$ADMIN_TOKEN"

test_route "PUT" "/profile" "Atualizar perfil do usuário" \
    '-d "{\"name\":\"Updated Name\"}"' \
    "$ADMIN_TOKEN"

# 3. PROJETOS
echo "========================================="
echo "3. PROJETOS"
echo "========================================="

test_route "GET" "/projects" "Listar projetos públicos (filtrados)"

test_route "GET" "/projects?status=APPROVED" "Listar projetos aprovados"

test_route "GET" "/projects?courseId=1" "Listar projetos por curso"

test_route "GET" "/projects-admin" "Listar todos os projetos (ADMIN)" "" "$ADMIN_TOKEN"

test_route "GET" "/projects/metrics" "Obter métricas de projetos (ADMIN)" "" "$ADMIN_TOKEN"

test_route "POST" "/projects" "Criar novo projeto" \
    '-d "{\"name\":\"Projeto Teste\",\"subtitle\":\"Subtítulo\",\"overview\":\"Visão geral\",\"description\":\"Descrição completa\",\"expected_results\":\"Resultados esperados\",\"start_date\":\"2025-01-15T00:00:00.000Z\",\"duration\":12,\"numberVacancies\":10,\"status\":\"SUBMITTED\",\"audience\":\"INTERNAL\"}"' \
    "$ADMIN_TOKEN"

# Assumindo que existe um projeto com ID 1
PROJECT_ID="1"
test_route "GET" "/projects/${PROJECT_ID}" "Obter projeto por ID"

test_route "PUT" "/projects/${PROJECT_ID}" "Atualizar projeto" \
    '-d "{\"name\":\"Projeto Atualizado\"}"' \
    "$ADMIN_TOKEN"

test_route "PATCH" "/projects/${PROJECT_ID}/status" "Atualizar status do projeto (ADMIN)" \
    '-d "{\"status\":\"APPROVED\"}"' \
    "$ADMIN_TOKEN"

# 4. CURSOS
echo "========================================="
echo "4. CURSOS"
echo "========================================="

test_route "GET" "/courses" "Listar todos os cursos"

test_route "POST" "/courses" "Criar novo curso (ADMIN)" \
    '-d "{\"name\":\"Engenharia de Software\"}"' \
    "$ADMIN_TOKEN"

COURSE_ID="1"
test_route "GET" "/courses/${COURSE_ID}" "Obter curso por ID"

test_route "DELETE" "/courses/${COURSE_ID}" "Deletar curso (ADMIN)" "" "$ADMIN_TOKEN"

# 5. KEYWORDS
echo "========================================="
echo "5. KEYWORDS (PALAVRAS-CHAVE)"
echo "========================================="

test_route "GET" "/keywords" "Listar todas as keywords" "" "$ADMIN_TOKEN"

test_route "GET" "/keywords/projects/${PROJECT_ID}" "Obter keywords de um projeto"

test_route "POST" "/keywords/projects/${PROJECT_ID}" "Adicionar keyword ao projeto" \
    '-d "{\"name\":\"IA\"}"' \
    "$ADMIN_TOKEN"

KEYWORD_ID="1"
test_route "GET" "/keywords/${KEYWORD_ID}/projects" "Obter projetos de uma keyword"

test_route "DELETE" "/keywords/${KEYWORD_ID}/projects/${PROJECT_ID}" \
    "Remover keyword de um projeto" "" "$ADMIN_TOKEN"

# 6. INDICADORES DE IMPACTO
echo "========================================="
echo "6. INDICADORES DE IMPACTO"
echo "========================================="

test_route "GET" "/projects/${PROJECT_ID}/impact-indicators" \
    "Obter indicadores de um projeto"

test_route "POST" "/projects/${PROJECT_ID}/impact-indicators" \
    "Criar indicador de impacto" \
    '-d "{\"title\":\"Estudantes capacitados\",\"value\":50}"' \
    "$ADMIN_TOKEN"

INDICATOR_ID="1"
test_route "PUT" "/projects/${PROJECT_ID}/impact-indicators/${INDICATOR_ID}" \
    "Atualizar indicador de impacto" \
    '-d "{\"title\":\"Estudantes capacitados\",\"value\":100}"' \
    "$ADMIN_TOKEN"

test_route "DELETE" "/projects/${PROJECT_ID}/impact-indicators/${INDICATOR_ID}" \
    "Deletar indicador de impacto" "" "$ADMIN_TOKEN"

# 7. AI CHAT
echo "========================================="
echo "7. AI CHAT"
echo "========================================="

test_route "POST" "/ai/chat" "Chat com IA" \
    '-d "{\"message\":\"Olá, como você pode me ajudar?\"}"'

echo "========================================="
echo "    TESTES CONCLUÍDOS!"
echo "========================================="
