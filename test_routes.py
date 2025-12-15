#!/usr/bin/env python3
"""
Script para testar todas as rotas da API
"""
import requests
import json
from datetime import datetime
from typing import Optional

API_URL = "http://localhost:3000"
TOKEN = None
ADMIN_TOKEN = None

class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def test_route(method: str, endpoint: str, description: str, data: Optional[dict] = None, 
               token: Optional[str] = None, files: Optional[dict] = None):
    """Testa uma rota da API"""
    print(f"{Colors.YELLOW}[{method}]{Colors.NC} {endpoint}")
    print(f"Descrição: {description}")
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    url = f"{API_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, files=files, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=5)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            print(f"{Colors.RED}Método não suportado{Colors.NC}")
            return None
        
        # Status
        if 200 <= response.status_code < 300:
            print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.NC}")
        else:
            print(f"{Colors.RED}✗ Status: {response.status_code}{Colors.NC}")
        
        # Resposta
        try:
            resp_json = response.json()
            resp_str = json.dumps(resp_json, ensure_ascii=False)[:300]
            print(f"Resposta: {resp_str}")
        except:
            print(f"Resposta: {response.text[:300]}")
        
        print()
        print("---")
        print()
        
        return response
        
    except Exception as e:
        print(f"{Colors.RED}✗ Erro: {str(e)}{Colors.NC}")
        print()
        print("---")
        print()
        return None

def main():
    global TOKEN, ADMIN_TOKEN
    
    print("=" * 50)
    print("    TESTANDO TODAS AS ROTAS DA API")
    print("=" * 50)
    print()
    
    # 1. HEALTH CHECK
    print("=" * 50)
    print("1. HEALTH CHECK")
    print("=" * 50)
    test_route("GET", "/health", "Verifica saúde da API")
    
    # 2. AUTENTICAÇÃO E USUÁRIOS
    print("=" * 50)
    print("2. AUTENTICAÇÃO E USUÁRIOS")
    print("=" * 50)
    
    # Tentar login como admin
    print("Tentando fazer login como admin...")
    login_data = {
        "email": "admin@system.com",
        "password": "admin123"
    }
    resp = test_route("POST", "/login", "Login como admin", data=login_data)
    if resp and resp.status_code == 200:
        try:
            resp_data = resp.json()
            ADMIN_TOKEN = resp_data.get('data', {}).get('token') or resp_data.get('token')
            if ADMIN_TOKEN:
                print(f"{Colors.GREEN}✓ Login bem-sucedido! Token: {ADMIN_TOKEN[:20]}...{Colors.NC}\n")
            else:
                print(f"{Colors.RED}✗ Token não encontrado na resposta{Colors.NC}\n")
        except Exception as e:
            print(f"{Colors.RED}✗ Erro ao extrair token: {e}{Colors.NC}\n")
    else:
        print(f"{Colors.RED}✗ Login falhou. Criando usuário admin...{Colors.NC}")
        # Tentar criar usuário admin primeiro
        create_user_data = {
            "name": "Admin Test",
            "email": "admin@unifesspa.edu.br",
            "password": "admin123",
            "role": "ADMIN"
        }
        test_route("POST", "/user", "Criar usuário admin", data=create_user_data)
    
    print()
    
    # Testar outras rotas de usuário
    test_route("GET", "/users", "Listar todos os usuários (ADMIN)", token=ADMIN_TOKEN)
    
    new_user_data = {
        "name": "Professor Teste",
        "email": f"professor{datetime.now().timestamp()}@test.com",
        "password": "senha123",
        "role": "TEACHER"
    }
    test_route("POST", "/user", "Criar novo usuário (ADMIN)", data=new_user_data, token=ADMIN_TOKEN)
    
    update_profile_data = {"name": "Nome Atualizado"}
    test_route("PUT", "/profile", "Atualizar perfil", data=update_profile_data, token=ADMIN_TOKEN)
    
    # 3. CURSOS
    print("=" * 50)
    print("3. CURSOS")
    print("=" * 50)
    
    test_route("GET", "/courses", "Listar todos os cursos")
    
    course_data = {"name": f"Novo Curso {datetime.now().timestamp()}"}
    resp = test_route("POST", "/courses", "Criar novo curso (ADMIN)", data=course_data, token=ADMIN_TOKEN)
    
    course_id = None
    if resp and resp.status_code == 201:
        try:
            course_id = resp.json().get('course', {}).get('id')
            print(f"{Colors.BLUE}Course ID criado: {course_id}{Colors.NC}\n")
        except:
            pass
    
    if course_id:
        test_route("GET", f"/courses/{course_id}", "Obter curso por ID")
        test_route("DELETE", f"/courses/{course_id}", "Deletar curso (ADMIN)", token=ADMIN_TOKEN)
    
    # 4. PROJETOS
    print("=" * 50)
    print("4. PROJETOS")
    print("=" * 50)
    
    test_route("GET", "/projects", "Listar projetos públicos")
    test_route("GET", "/projects?status=APPROVED", "Listar projetos aprovados")
    test_route("GET", "/projects-admin", "Listar todos os projetos (ADMIN)", token=ADMIN_TOKEN)
    test_route("GET", "/projects/metrics", "Obter métricas (ADMIN)", token=ADMIN_TOKEN)
    
    # Pegar um curso existente para associar ao projeto
    courses_resp = requests.get(f"{API_URL}/courses")
    course_id = None
    if courses_resp.status_code == 200:
        courses = courses_resp.json()
        if courses:
            course_id = courses[0]['id']
    
    project_data = {
        "name": f"Projeto Teste {datetime.now().timestamp()}",
        "subtitle": "Subtítulo do projeto",
        "overview": "Visão geral do projeto",
        "description": "Descrição completa do projeto de extensão",
        "expected_results": "Resultados esperados com o projeto",
        "start_date": "2025-02-01T00:00:00.000Z",
        "duration": 12,
        "numberVacancies": 20,
        "status": "SUBMITTED",
        "audience": "INTERNAL",
        "courseId": course_id
    }
    
    resp = test_route("POST", "/projects", "Criar novo projeto", data=project_data, token=ADMIN_TOKEN)
    
    project_id = None
    if resp and resp.status_code == 201:
        try:
            project_id = resp.json().get('project', {}).get('id')
            print(f"{Colors.BLUE}Project ID criado: {project_id}{Colors.NC}\n")
        except:
            pass
    
    if project_id:
        test_route("GET", f"/projects/{project_id}", "Obter projeto por ID")
        
        update_data = {"name": "Projeto Atualizado"}
        test_route("PUT", f"/projects/{project_id}", "Atualizar projeto", data=update_data, token=ADMIN_TOKEN)
        
        status_data = {"status": "APPROVED"}
        test_route("PATCH", f"/projects/{project_id}/status", "Aprovar projeto (ADMIN)", 
                   data=status_data, token=ADMIN_TOKEN)
        
        # 5. KEYWORDS
        print("=" * 50)
        print("5. KEYWORDS")
        print("=" * 50)
        
        test_route("GET", "/keywords", "Listar todas as keywords", token=ADMIN_TOKEN)
        test_route("GET", f"/keywords/projects/{project_id}", "Keywords do projeto")
        
        keyword_data = {"name": "Inteligência Artificial"}
        resp = test_route("POST", f"/keywords/projects/{project_id}", "Adicionar keyword", 
                          data=keyword_data, token=ADMIN_TOKEN)
        
        # 6. INDICADORES DE IMPACTO
        print("=" * 50)
        print("6. INDICADORES DE IMPACTO")
        print("=" * 50)
        
        test_route("GET", f"/projects/{project_id}/impact-indicators", "Listar indicadores")
        
        indicator_data = {"title": "Estudantes capacitados", "value": 50}
        resp = test_route("POST", f"/projects/{project_id}/impact-indicators", 
                          "Criar indicador", data=indicator_data, token=ADMIN_TOKEN)
        
        indicator_id = None
        if resp and resp.status_code == 201:
            try:
                indicator_id = resp.json().get('indicator', {}).get('id')
                print(f"{Colors.BLUE}Indicator ID criado: {indicator_id}{Colors.NC}\n")
            except:
                pass
        
        if indicator_id:
            update_indicator = {"title": "Estudantes capacitados", "value": 100}
            test_route("PUT", f"/projects/{project_id}/impact-indicators/{indicator_id}", 
                       "Atualizar indicador", data=update_indicator, token=ADMIN_TOKEN)
            
            test_route("DELETE", f"/projects/{project_id}/impact-indicators/{indicator_id}", 
                       "Deletar indicador", token=ADMIN_TOKEN)
        
        # Deletar projeto
        test_route("DELETE", f"/projects/{project_id}", "Deletar projeto", token=ADMIN_TOKEN)
    
    # 7. AI CHAT
    print("=" * 50)
    print("7. AI CHAT")
    print("=" * 50)
    
    chat_data = {"question": "Olá, como você pode me ajudar com projetos de extensão?"}
    test_route("POST", "/ai/chat", "Chat com IA", data=chat_data)
    
    print("=" * 50)
    print("    TESTES CONCLUÍDOS!")
    print("=" * 50)

if __name__ == "__main__":
    main()
