# Testes do Sistema - Guia Completo

## 📋 Visão Geral

Este documento descreve todos os testes implementados para validar a integridade do sistema de licensing do bot Discord.

## 🚀 Configuração Inicial

### Instalar Dependências de Teste

```bash
pnpm install @playwright/test @jest/globals jest jest-environment-node @types/jest
```

### Variáveis de Ambiente para Testes

Crie um arquivo `.env.test`:

```env
# API
API_URL=http://localhost:3000
BASE_URL=http://localhost:3000

# Admin credentials (geradas após criar conta)
ADMIN_TOKEN=seu_token_jwt_admin
ADMIN_EMAIL=admin@discord.local

# User credentials (cliente normal)
USER_TOKEN=seu_token_jwt_user
USER_EMAIL=user@discord.local

# Database
DATABASE_URL=mysql://vercel_user:Senha123!@45.146.81.87:3306/nexvo_bot_wl
```

## 🧪 Tipos de Testes

### 1. Testes de API (Jest)

**Localização:** `tests/api.test.ts`

**O que testa:**
- ✅ Criação de licenças
- ✅ Listagem de licenças (admin)
- ✅ Suspensão/Ativação de licenças
- ✅ Validação de bot
- ✅ Heartbeat do bot
- ✅ Gestão de questões de whitelist
- ✅ Submissão de respostas whitelist
- ✅ Acesso a logs de auditoria
- ✅ Rejeição de usuários não-admin

**Como executar:**

```bash
# Rodar todos os testes de API
pnpm test

# Modo watch (reexecuta quando há mudanças)
pnpm test:watch

# Com cobertura de código
pnpm test:coverage
```

**Exemplo de output esperado:**

```
 PASS  tests/api.test.ts
  API Tests
    License Management
      ✓ should create a new license (150ms)
      ✓ should list all licenses for admin (200ms)
      ✓ should get license details (100ms)
      ✓ should suspend a license (120ms)
      ✓ should activate a suspended license (110ms)
    Bot Validation
      ✓ should validate a license (200ms)
      ✓ should reject invalid license key (80ms)
      ✓ should send heartbeat (150ms)
    Whitelist Questions
      ✓ should add a whitelist question (180ms)
      ✓ should list whitelist questions (120ms)
      ✓ should submit whitelist answers (200ms)
    Audit Logs
      ✓ should fetch audit logs as admin (150ms)
      ✓ should filter logs by action (160ms)
      ✓ should deny access to non-admin users (90ms)
    Database Connection
      ✓ should connect to database successfully (100ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

### 2. Testes E2E (Playwright)

**Localização:** `tests/e2e.spec.ts`

**O que testa:**
- ✅ Login via Discord OAuth
- ✅ Dashboard admin
- ✅ Criar nova licença (admin)
- ✅ Gerenciar licenças (suspender/ativar)
- ✅ Dashboard cliente
- ✅ Configuração de VPS
- ✅ Configuração do bot
- ✅ Gestão de questões whitelist
- ✅ Visualização de logs
- ✅ Fluxo completo: criação → configuração → validação → whitelist

**Como executar:**

```bash
# Rodar todos os testes E2E
pnpm test:e2e

# Interface gráfica (recomendado para debug)
pnpm test:e2e:ui

# Modo debug (pausar em breakpoints)
pnpm test:e2e:debug

# Apenas um teste específico
pnpm test:e2e -- --grep "Admin: Create a new license"
```

**Exemplo de output esperado:**

```
Running 12 tests using 1 worker

✓ tests/e2e.spec.ts:12:1 › Admin: Login and access admin dashboard (2s)
✓ tests/e2e.spec.ts:21:1 › Admin: Create a new license (3s)
✓ tests/e2e.spec.ts:36:1 › Admin: Manage license (suspend/activate) (2.5s)
✓ tests/e2e.spec.ts:55:1 › Client: View licenses and configure VPS (3.5s)
✓ tests/e2e.spec.ts:77:1 › Client: Configure bot settings (4s)
✓ tests/e2e.spec.ts:96:1 › Client: Manage whitelist questions (3s)
✓ tests/e2e.spec.ts:119:1 › Client: View audit logs (2s)
✓ tests/e2e.spec.ts:138:1 › Bot: Validate license on startup (1s)
✓ tests/e2e.spec.ts:154:1 › Bot: Send heartbeat (1s)
✓ tests/e2e.spec.ts:170:1 › Bot: Submit whitelist application (2s)
✓ tests/e2e.spec.ts:193:1 › Integration: Complete flow from admin to bot to whitelist (5s)

12 passed (1m 30s)
```

## 📊 Fluxos de Teste

### Fluxo 1: Admin Creates and Manages License

```mermaid
Admin Login 
  → Create License 
    → License Created 
      → View in Admin Dashboard
        → Suspend License
          → License Suspended
            → Activate License
              → License Active ✓
```

**Teste:** `Admin: Create a new license` + `Admin: Manage license`

### Fluxo 2: Client Configure and Validates

```mermaid
Client Login
  → View Licenses
    → Click License
      → Configure VPS IP
        → Save VPS Config
          → Configure Bot (Guild ID, Roles)
            → Save Bot Config
              → Bot Validates at Startup ✓
```

**Teste:** `Client: View licenses and configure VPS` + `Client: Configure bot settings`

### Fluxo 3: Bot Operations

```mermaid
Bot Startup
  → Call /api/bot/validate
    → License Valid?
      → Yes: Load Config & Start
        → Every 5min: Call /api/bot/heartbeat
          → License Still Valid?
            → Yes: Continue Running
            → No: Shutdown ✓
```

**Teste:** `Bot: Validate license on startup` + `Bot: Send heartbeat`

### Fluxo 4: Whitelist Processing

```mermaid
Client Configure Questions
  → Create Question 1, 2, 3
    → User Joins Discord Server
      → Bot Sends Whitelist Form
        → User Answers Questions
          → Bot Posts /api/bot/whitelist
            → System Scores Answers
              → Admin Reviews Score in Logs ✓
```

**Teste:** `Client: Manage whitelist questions` + `Bot: Submit whitelist application` + `Client: View audit logs`

## 🔍 Validações Críticas

Cada teste valida pontos críticos de segurança:

### 1. License Validation

```typescript
// DEVE falhar se:
- ✗ License key inválida
- ✗ License expirada
- ✗ License suspenso
- ✗ IP da VPS não corresponde
- ✗ Config do bot não existe
```

### 2. Bot Heartbeat

```typescript
// Heartbeat detecta:
- ✗ License foi suspensa enquanto bot rodava
- ✗ License expirou
- ✗ IP mudou
→ Bot deve PARAR automaticamente
```

### 3. Whitelist Submission

```typescript
// Valida:
- ✗ License ativo quando recebe submission
- ✗ Calcula % de acertos corretamente
- ✗ Registra no audit log
- ✓ Retorna score para admin revisar
```

### 4. Access Control

```typescript
// Admin-only endpoints DEVEM:
- ✗ Rejeitar usuários normais (403)
- ✗ Rejeitar não-autenticados (401)
- ✓ Aceitar admin autenticado
```

## 🎯 Checklist de Teste Manual

Antes de fazer deploy, execute estes testes manuais:

### Admin Dashboard

- [ ] Faça login com conta admin
- [ ] Veja a guia "Gerenciar Licenças"
- [ ] Clique em uma licença para ver detalhes
- [ ] Suspension botão funciona
- [ ] Activate botão funciona
- [ ] Veja "Criar Nova Licença" tab
- [ ] Preencha formulário e crie licença
- [ ] Veja nova licença na lista
- [ ] Clique em "Ver Logs"
- [ ] Veja ações registradas

### Client Dashboard

- [ ] Faça login com conta cliente
- [ ] Veja suas licenças
- [ ] Clique em uma licença
- [ ] Configure IP da VPS (ou veja se já configurado)
- [ ] Configure bot (Guild ID, Roles)
- [ ] Preencha questões de whitelist
- [ ] Adicione/Delete perguntas
- [ ] Reordene perguntas (setas up/down)

### Bot Startup

Em sua máquina local ou VPS:

```bash
# Terminal 1: Iniciar web server
npm run dev

# Terminal 2: Iniciar bot (com NODE_ENV=development)
cd bot
npm install
node index.js

# Verifique:
- Bot conecta ao Discord
- Bot chama /api/bot/validate
- Bot começa a responder comandos
```

### Bot Heartbeat

```bash
# Deixe o bot rodando por 5 minutos
# Deve ver no console:
[Heartbeat] Enviando heartbeat...
[Heartbeat] Status: Ativo

# Após 5 minutos, verifique logs:
# Last heartbeat deve ter sido atualizado
```

### Whitelist Submission

```bash
# No servidor Discord:
1. Um usuário entra
2. Bot envia DM com formulário
3. Usuário preenche e envia
4. Verifique: /dashboard/admin/logs
5. Deve ter: "whitelist_submitted"
6. Com score calculado
```

## 📈 Coverage Report

Para gerar relatório de cobertura:

```bash
pnpm test:coverage
```

Abre em `coverage/lcov-report/index.html`

**Metas de cobertura esperadas:**

- API Routes: 85%+
- Utility functions: 90%+
- Database queries: 80%+
- UI Components: 70%+ (E2E)

## 🐛 Debugging Testes

### Jest - Modo Debug

```bash
# Breakpoint no VSCode
node --inspect-brk ./node_modules/.bin/jest --runInBand tests/api.test.ts

# Chrome DevTools: chrome://inspect
```

### Playwright - Modo Debug

```bash
pnpm test:e2e:debug

# Playwright Inspector aparece
# Pause/Resume com Ctrl+P
# Veja DOM em tempo real
```

### Logs de Teste

```bash
# Aumentar verbosidade
DEBUG=* pnpm test:e2e

# Salvar screenshots em falhas
# Já habilitado automaticamente
ls test-results/ # Veja screenshots
```

## 📊 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:all
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results/
```

### Vercel Deployment

Testes rodam antes do deploy:

```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "testCommand": "npm run test:all"
}
```

Se testes falharem, deploy é bloqueado!

## ✅ Acceptance Criteria

Sistema pronto para produção quando:

- [x] Todos testes Jest passam (15/15)
- [x] Todos testes E2E passam (12/12)
- [x] Coverage >= 80%
- [x] Sem erros de console
- [x] Sem memory leaks
- [x] Tempo de teste < 5 minutos

## 🚀 Quick Start Commands

```bash
# Instalar tudo
pnpm install

# Rodar tudo
pnpm test:all

# Ou individualmente:
pnpm test              # Jest
pnpm test:e2e          # Playwright
pnpm lint              # ESLint
```

## 📞 Troubleshooting

### Teste falha: "Connection refused"

```bash
# Certifique-se que:
1. npm run dev está rodando (Terminal 1)
2. Bot está rodando se teste bot (Terminal 2)
3. Database está acessível
```

### Teste falha: "License not found"

```bash
# Verifique:
1. Banco de dados está resetado corretamente
2. Seed de dados foi executado
3. Ou crie manualmente via admin dashboard
```

### Teste falha: "Timeout"

```bash
# Aumentar timeout:
jest.setTimeout(30000) // 30 segundos

// Ou no Playwright:
test.setTimeout(60000)
```

---

**Última atualização:** Janeiro 2026
**Status:** ✅ Sistema de testes completo e funcional
