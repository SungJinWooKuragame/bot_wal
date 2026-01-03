# 📚 Documentação Completa - Sistema de Bot de Whitelist

## 🎯 Sumário Executivo

Este é um **sistema completo de licensing e whitelist para bots Discord** construído com:

- **Frontend:** Next.js 16 (TypeScript) no Vercel
- **Backend:** Node.js com Discord.js na VPS Windows com XAMPP
- **Database:** MySQL/MariaDB (45.146.81.87)
- **Auth:** NextAuth.js com Discord OAuth2

**Status:** ✅ Sistema completo, testado e pronto para produção

---

## 📂 Estrutura do Projeto

```
discord-bot-creation/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── admin/               # Admin endpoints
│   │   │   ├── create-license/  # POST: criar licença
│   │   │   ├── licenses/        # GET: listar | POST: criar
│   │   │   │   └── [id]/action/ # POST: suspender/ativar/expirar
│   │   │   └── audit-logs/      # GET: logs com filtros
│   │   ├── auth/[...nextauth]/  # NextAuth config
│   │   ├── bot/
│   │   │   ├── validate/        # POST: validar bot na startup
│   │   │   ├── heartbeat/       # POST: health check 5min
│   │   │   ├── config/          # GET: config do bot
│   │   │   └── whitelist/       # POST: submeter whitelist
│   │   └── licenses/
│   │       └── [id]/
│   │           ├── questions/   # CRUD questões whitelist
│   │           ├── logs/        # GET logs validação
│   │           └── configure-*/ # POST configurar VPS/bot
│   ├── dashboard/
│   │   ├── page.tsx            # Cliente: lista licenças
│   │   ├── admin/              # Admin: gerenciar
│   │   │   ├── page.tsx        # Tabs: gerenciar | criar
│   │   │   ├── logs/           # Ver auditoria
│   │   │   └── ...
│   │   └── licenses/
│   │       └── [id]/           # Detalhes + config
│   └── ...
├── components/                 # React components
│   ├── ui/                    # shadcn/ui
│   ├── license-card.tsx
│   ├── bot-config-form.tsx
│   ├── license-questions-form.tsx
│   ├── license-management-card.tsx
│   └── ...
├── lib/
│   ├── auth.ts               # Helpers de auth
│   ├── db.ts                 # Pool MySQL
│   ├── audit.ts              # Logging
│   └── utils.ts
├── bot/                      # Node.js bot
│   ├── index.js             # Main entry
│   └── package.json
├── tests/                    # Testes automatizados
│   ├── e2e.spec.ts         # Playwright
│   └── api.test.ts         # Jest
├── scripts/                 # SQL schemas
│   ├── 001-create-tables.sql
│   ├── 002-add-admin-column.sql
│   └── 003-add-whitelist-and-audit.sql
└── ...

```

---

## 🗄️ Database Schema

### Tables Principais

#### `users`
```sql
id UUID PRIMARY KEY
discord_id VARCHAR(255) UNIQUE
username VARCHAR(255)
email VARCHAR(255)
avatar_url TEXT
is_admin BOOLEAN DEFAULT 0
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### `licenses`
```sql
id UUID PRIMARY KEY
license_key VARCHAR(255) UNIQUE
user_id UUID FOREIGN KEY
status ENUM('active', 'suspended', 'expired', 'deleted')
plan_type VARCHAR(50) -- 'basic', 'professional', 'enterprise'
vps_ip VARCHAR(45)
vps_hostname VARCHAR(255)
expires_at TIMESTAMP
last_heartbeat TIMESTAMP
bot_version VARCHAR(50)
created_at TIMESTAMP
```

#### `bot_configs`
```sql
license_id UUID PRIMARY KEY FOREIGN KEY
guild_id VARCHAR(255)
whitelist_role_id VARCHAR(255)
log_channel_id VARCHAR(255)
accept_channel_id VARCHAR(255)
reprove_channel_id VARCHAR(255)
embed_color VARCHAR(7) DEFAULT '#0099FF'
welcome_message TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### `license_questions`
```sql
id UUID PRIMARY KEY
license_id UUID FOREIGN KEY
question_text TEXT
question_type ENUM('text', 'textarea', 'select', 'number', 'email')
options JSON -- [{label: "...", value: "...", correct: true}, ...]
required BOOLEAN DEFAULT 1
sequence INT
created_at TIMESTAMP
```

#### `whitelist_entries`
```sql
id UUID PRIMARY KEY
license_id UUID FOREIGN KEY
user_id VARCHAR(255)
user_name VARCHAR(255)
answers JSON
score INT
max_score INT
status ENUM('pending', 'approved', 'rejected')
created_at TIMESTAMP
```

#### `validation_logs`
```sql
id UUID PRIMARY KEY
license_id UUID FOREIGN KEY
action ENUM('validate', 'heartbeat')
result ENUM('success', 'failure')
error_message TEXT
ip_address VARCHAR(45)
created_at TIMESTAMP
```

#### `audit_logs`
```sql
id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
license_id UUID FOREIGN KEY
action VARCHAR(100)
details JSON
ip_address VARCHAR(45)
created_at TIMESTAMP
```

---

## 🔐 Fluxos de Autenticação

### 1. User Login (Discord OAuth2)

```
User clica "Entrar com Discord"
  ↓
NextAuth redireciona para Discord OAuth
  ↓
Discord pede autorização
  ↓
Discord retorna código
  ↓
NextAuth troca código por token
  ↓
Cria/Atualiza user em MySQL
  ↓
Cria JWT session (maxAge: 60s, revalidate rápido)
  ↓
Redirect para /dashboard
```

### 2. Bot Startup Validation

```
Bot inicia
  ↓
Lê variável: NEXVO_LICENSE_KEY
  ↓
POST /api/bot/validate
  {
    license_key: "...",
    bot_version: "1.0.0"
  }
  ↓
Server verifica:
  - License existe?
  - Status = 'active'?
  - Expiration > now?
  - Config existe?
  ↓
Response:
  {
    valid: true,
    config: { guild_id, roles, channels, ... }
  }
  ↓
Bot começa ou encerra
```

### 3. Bot Heartbeat (Every 5 min)

```
Timer cada 5 minutos
  ↓
POST /api/bot/heartbeat
  {
    license_key: "...",
    ip: "45.146.81.87"
  }
  ↓
Server verifica status
  ↓
Response:
  {
    status: "ok",
    shouldStop: false,
    lastValidation: timestamp
  }
  ↓
Se shouldStop=true, bot encerra
```

---

## 🚀 Deploy & Configuração

### 1️⃣ VPS Setup (Windows + XAMPP)

**Já feito? Procure no SETUP.md**

```bash
# 1. XAMPP instalado e rodando
# 2. MySQL iniciado (port 3306)
# 3. Credenciais: vercel_user / Senha123!
# 4. Database: nexvo_bot_wl criada
```

### 2️⃣ Web Frontend (Vercel)

```bash
# 1. Push para GitHub (já feito)
# 2. Conectar repo a Vercel
# 3. Env vars Vercel:
DATABASE_URL=mysql://vercel_user:Senha123!@45.146.81.87:3306/nexvo_bot_wl
NEXTAUTH_SECRET=sua_secret_aqui
NEXTAUTH_URL=https://bot-wal.vercel.app
DISCORD_ID=seu_discord_app_id
DISCORD_SECRET=seu_discord_app_secret
```

### 3️⃣ Discord App Config

No [Discord Developer Portal](https://discord.com/developers/applications):

```
OAuth2 > Redirects:
- https://bot-wal.vercel.app/api/auth/callback/discord

Scopes needed:
- identify
- email
```

### 4️⃣ Bot Startup

```bash
cd bot
npm install
npm start

# Ou com PM2 (recomendado):
pm2 start index.js --name "nexvo-bot" --watch
```

---

## 📊 Casos de Uso

### 1. Admin Criar Licença

**Fluxo:**
1. Admin acessa `/dashboard/admin`
2. Clica "Criar Nova Licença"
3. Preenche: Nome cliente, tipo plano, validade
4. Sistema gera LICENSE_KEY único
5. Salva no banco
6. Admin compartilha com cliente

**Dados:**
```json
{
  "client_name": "FiveM RP Server",
  "plan_type": "professional",
  "validity_months": 12
}
```

**Resultado:**
```json
{
  "id": "uuid-here",
  "license_key": "NXV-XXXX-XXXX-XXXX",
  "status": "active",
  "expires_at": "2027-01-02T12:00:00Z"
}
```

### 2. Cliente Configurar Bot

**Fluxo:**
1. Cliente faz login
2. Vê suas licenças
3. Clica em uma licença
4. Configura IP da VPS
5. Configura bot (Guild ID, Roles, Channels)
6. Personaliza questões de whitelist
7. Baixa bot executável

**Dados Salvos:**
```sql
-- bot_configs
INSERT INTO bot_configs VALUES (
  license_id: "...",
  guild_id: "1234567890",
  whitelist_role_id: "0987654321",
  log_channel_id: "5555555555",
  welcome_message: "Bem-vindo {user} ao servidor {server}!"
);

-- license_questions (x3)
INSERT INTO license_questions VALUES (
  license_id: "...",
  question_text: "Qual é seu nome?",
  question_type: "text",
  sequence: 1
);
```

### 3. Bot Validar & Iniciar

**No arquivo .env do bot:**
```
NEXVO_LICENSE_KEY=NXV-XXXX-XXXX-XXXX
DISCORD_TOKEN=seu_bot_token
```

**Na startup:**
```javascript
// 1. POST /api/bot/validate
const validation = await fetch(API_URL + '/api/bot/validate', {
  method: 'POST',
  body: JSON.stringify({
    license_key: process.env.NEXVO_LICENSE_KEY,
    bot_version: '1.0.0'
  })
})

// 2. Se válido, continua
// 3. Se inválido, process.exit(1)

// 4. A cada 5 min, heartbeat
setInterval(async () => {
  await fetch(API_URL + '/api/bot/heartbeat', {
    method: 'POST',
    body: JSON.stringify({
      license_key: process.env.NEXVO_LICENSE_KEY,
      ip: require('os').networkInterfaces().eth0[0].address
    })
  })
}, 5 * 60 * 1000)
```

### 4. Usuário Fazer Whitelist

**Fluxo:**
1. Usuário entra no server Discord
2. Bot envia DM com formulário
3. Usuário responde (Discord Interaction)
4. Bot submete: POST /api/bot/whitelist
5. Sistema calcula score
6. Admin vê em `/dashboard/admin/logs`
7. Admin aprova/rejeita

**Exemplo de submissão:**
```json
{
  "license_key": "NXV-XXXX-XXXX-XXXX",
  "user_id": "123456789",
  "user_name": "JohnDoe#1234",
  "answers": {
    "question-1": "João Silva",
    "question-2": "São Paulo",
    "question-3": "Experiência"
  }
}
```

**Response:**
```json
{
  "success": true,
  "score": 3,
  "maxScore": 3,
  "percentage": 100,
  "message": "Whitelist accepted!"
}
```

---

## 🔒 Security Features

### 1. License Validation

- ✅ Chave única e verificável
- ✅ IP da VPS vinculado (só aquele IP pode usar)
- ✅ Expiration automática
- ✅ Suspension imediata via admin
- ✅ Heartbeat detecta mudanças e encerra bot

### 2. Admin Controls

- ✅ Apenas admins veem admin panel
- ✅ Middleware protege rotas `/admin`
- ✅ Audit log rastreia tudo
- ✅ Ações sensíveis requerem confirmação

### 3. Audit Trail

Tudo registrado:
- Quando licença foi criada
- Quando foi suspensa
- Quando bot validou
- Quando usuário entrou no whitelist
- IP de cada ação

### 4. Session Security

- ✅ JWT sessions com expiração curta (60s)
- ✅ Revalidação automática
- ✅ Sempre busca dados frescos do DB
- ✅ HTTP-only cookies

---

## 🧪 Testes

### Rodar Testes Completos

```bash
# Instalar dependências de teste
pnpm install

# Todos os testes
pnpm test:all

# Ou individualmente:
pnpm test              # Jest (APIs)
pnpm test:watch       # Jest em tempo real
pnpm test:coverage    # Com cobertura
pnpm test:e2e         # Playwright (UI)
pnpm test:e2e:ui      # Playwright visual
```

### Testes Inclusos

**Jest API Tests (15 testes):**
- ✓ Criar licença
- ✓ Listar licenças
- ✓ Suspender/Ativar
- ✓ Validar bot
- ✓ Heartbeat
- ✓ Whitelist questions CRUD
- ✓ Submeter whitelist
- ✓ Audit logs
- ✓ Access control

**Playwright E2E Tests (12 testes):**
- ✓ Login Discord
- ✓ Admin create license
- ✓ Admin manage license
- ✓ Client configure VPS
- ✓ Client configure bot
- ✓ Client manage questions
- ✓ View audit logs
- ✓ Bot validate
- ✓ Bot heartbeat
- ✓ Submit whitelist
- ✓ Integration flow completo

Ver detalhes em [TESTES_GUIA.md](./TESTES_GUIA.md)

---

## 📱 API Reference

### Admin Endpoints

#### POST /api/admin/licenses
Criar licença
```bash
curl -X POST https://bot-wal.vercel.app/api/admin/licenses \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Server Name",
    "plan_type": "professional",
    "validity_months": 12
  }'
```

#### GET /api/admin/licenses
Listar todas licenças
```bash
curl https://bot-wal.vercel.app/api/admin/licenses \
  -H "Authorization: Bearer JWT_TOKEN"
```

#### POST /api/admin/licenses/[id]/action
Suspender/Ativar/Expirar/Deletar
```bash
curl -X POST https://bot-wal.vercel.app/api/admin/licenses/UUID/action \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "suspend" }'
```

#### GET /api/admin/audit-logs
Ver logs (com filtros)
```bash
curl "https://bot-wal.vercel.app/api/admin/audit-logs?action=license_created&limit=50" \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Bot Endpoints

#### POST /api/bot/validate
Validar bot na startup
```bash
curl -X POST https://bot-wal.vercel.app/api/bot/validate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "NXV-...",
    "bot_version": "1.0.0"
  }'
```

#### POST /api/bot/heartbeat
Health check (a cada 5 min)
```bash
curl -X POST https://bot-wal.vercel.app/api/bot/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "NXV-...",
    "ip": "45.146.81.87"
  }'
```

#### POST /api/bot/whitelist
Submeter respostas de whitelist
```bash
curl -X POST https://bot-wal.vercel.app/api/bot/whitelist \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "NXV-...",
    "user_id": "123456789",
    "user_name": "Username#1234",
    "answers": {
      "q1": "Resposta 1",
      "q2": "Resposta 2"
    }
  }'
```

### Client Endpoints

#### GET /api/licenses/[id]/questions
Obter questões de whitelist
```bash
curl https://bot-wal.vercel.app/api/licenses/UUID/questions
```

#### POST /api/licenses/[id]/questions
Adicionar/Editar/Deletar questão
```bash
curl -X POST https://bot-wal.vercel.app/api/licenses/UUID/questions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "question_text": "What is your name?",
    "question_type": "text",
    "required": true
  }'
```

---

## 🐛 Troubleshooting

### Bot não conecta ao banco de dados

**Problema:** `Connection refused 45.146.81.87:3306`

**Solução:**
```bash
# 1. VPS: Verificar se MySQL está rodando
# 2. XAMPP: Services > MySQL > Start
# 3. Verificar firewall abrindo port 3306
# 4. Verificar credenciais corretas
# 5. Testar conexão:
mysql -h 45.146.81.87 -u vercel_user -pSenha123!
```

### Admin não vê painel admin

**Problema:** Redireciona para `/dashboard` normal

**Solução:**
1. Verificar `is_admin=1` no banco: `SELECT is_admin FROM users WHERE id='...'`
2. Se `0`, atualizar: `UPDATE users SET is_admin=1 WHERE id='...'`
3. Fazer logout e login de novo
4. Sessão expira em 60s, aguarde revalidação

### Bot para de responder

**Problema:** Bot desconectado

**Solução:**
1. Verificar logs: `console.log` em `bot/index.js`
2. Checar heartbeat: vê mensagem a cada 5 min?
3. Se shouldStop=true, bot encerrou - verificar license
4. Reiniciar: `pm2 restart nexvo-bot`

### Whitelist não funciona

**Problema:** Bot recebe respostas mas não processa

**Solução:**
1. Verificar license ativo: `/dashboard/admin`
2. Verificar questões configuradas: `/dashboard/licenses/[id]`
3. Testar endpoint manual: `curl -X POST /api/bot/whitelist`
4. Ver logs: `/dashboard/admin/logs`

---

## 📈 Monitoring & Maintenance

### Verificar Status Sistema

```sql
-- Licenças ativas agora
SELECT COUNT(*) FROM licenses WHERE status='active' AND expires_at > NOW();

-- Últimos heartbeats
SELECT license_id, last_heartbeat FROM licenses ORDER BY last_heartbeat DESC LIMIT 10;

-- Uso hoje
SELECT COUNT(*) FROM validation_logs WHERE DATE(created_at) = CURDATE();

-- Logs de auditoria hoje
SELECT COUNT(*) FROM audit_logs WHERE DATE(created_at) = CURDATE();
```

### Backup Database

```bash
# Backup completo
mysqldump -h 45.146.81.87 -u vercel_user -pSenha123! nexvo_bot_wl > backup.sql

# Restaurar
mysql -h 45.146.81.87 -u vercel_user -pSenha123! nexvo_bot_wl < backup.sql
```

### Database Maintenance

```sql
-- Ver tamanho
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'nexvo_bot_wl'
ORDER BY size_mb DESC;

-- Otimizar
OPTIMIZE TABLE licenses;
OPTIMIZE TABLE users;
OPTIMIZE TABLE audit_logs;

-- Ver índices
SHOW INDEXES FROM licenses;
```

---

## 🚀 Next Steps

### Para melhorar ainda mais:

- [ ] Two-factor authentication para admin
- [ ] Rate limiting nos endpoints críticos
- [ ] Email notifications quando license expira
- [ ] Dashboard com gráficos/analytics
- [ ] Export de relatórios em PDF
- [ ] Webhook notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📞 Support

**Documentos úteis:**
- [TESTES_GUIA.md](./TESTES_GUIA.md) - Como rodar testes
- [SETUP.md](./SETUP.md) - Setup inicial
- [README.md](./README.md) - Visão geral rápida

**Database:**
- Host: 45.146.81.87
- Database: nexvo_bot_wl
- User: vercel_user

**Git:**
- Repo: https://github.com/SungJinWooKuragame/bot_wal
- Branch: main

---

**Última atualização:** Janeiro 2026
**Status:** ✅ Produção
**Versão:** 1.0.0
