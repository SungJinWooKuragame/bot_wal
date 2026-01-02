# RESUMO COMPLETO - Sistema de Licenças para Bot Discord de Whitelist FiveM

## VISÃO GERAL DO PROJETO

Sistema completo de venda e gerenciamento de bot Discord para whitelist de servidores FiveM. O projeto consiste em:

1. **Dashboard Web (Next.js)** - Hospedado no Vercel em https://bot-wal.vercel.app
2. **Bot Discord (Node.js)** - Roda na VPS do cliente
3. **Banco de Dados MySQL** - Hospedado na VPS em 45.146.81.87

## ARQUITETURA DO SISTEMA

### Como Funciona o Fluxo Completo:

1. **Admin (Você) cria licença no dashboard**
   - Acessa https://bot-wal.vercel.app/dashboard/admin
   - Preenche Discord ID do comprador
   - Escolhe tipo de plano (Lifetime, Mensal, Anual)
   - Sistema gera chave única (ex: WL-ABC123-DEF456)
   
2. **Cliente recebe a chave e configura**
   - Faz login no site com Discord OAuth2
   - Ativa a licença colando a chave
   - Configura IP da VPS onde vai rodar o bot
   - Personaliza perguntas, cores, canais, etc.

3. **Cliente instala o bot na VPS dele**
   - Baixa pasta `/bot`
   - Cria arquivo `.env` com a chave de licença
   - Roda `npm install && node index.js`

4. **Bot valida e funciona**
   - Bot conecta com a API do dashboard
   - Valida licença + IP da VPS
   - Carrega configurações do banco de dados
   - Envia heartbeat a cada 5 minutos
   - Só funciona se licença válida e IP correto

## ESTRUTURA DO BANCO DE DADOS

### Tabela: `users`
```sql
- id (VARCHAR PRIMARY KEY)
- discord_id (VARCHAR UNIQUE) - ID do Discord do usuário
- discord_username (VARCHAR) - Nome de usuário no Discord
- email (VARCHAR) - Email do Discord
- avatar_url (TEXT) - Avatar do Discord
- is_admin (TINYINT) - 0 = usuário normal, 1 = admin
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Como tornar alguém admin:**
```sql
UPDATE users SET is_admin = 1 WHERE discord_id = 'SEU_DISCORD_ID';
```

### Tabela: `licenses`
```sql
- id (VARCHAR PRIMARY KEY)
- license_key (VARCHAR UNIQUE) - Chave da licença (ex: WL-ABC123-DEF456)
- user_id (VARCHAR) - FK para users.id
- plan_type (ENUM) - 'lifetime', 'monthly', 'yearly'
- status (ENUM) - 'active', 'expired', 'suspended'
- vps_ip (VARCHAR) - IP da VPS autorizado
- last_heartbeat (TIMESTAMP) - Último ping do bot
- expires_at (TIMESTAMP) - Data de expiração (NULL se lifetime)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `bot_configs`
```sql
- id (VARCHAR PRIMARY KEY)
- license_id (VARCHAR UNIQUE) - FK para licenses.id
- guild_id (VARCHAR) - ID do servidor Discord
- whitelist_channel_id (VARCHAR) - Canal para pedidos de WL
- approved_channel_id (VARCHAR) - Canal de aprovações
- denied_channel_id (VARCHAR) - Canal de negações
- admin_role_id (VARCHAR) - Role que pode aprovar/negar
- embed_color (VARCHAR) - Cor dos embeds (hex)
- welcome_message (TEXT) - Mensagem de boas-vindas
- questions (JSON) - Array de perguntas personalizadas
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Exemplo de JSON questions:**
```json
[
  {"label": "Nome Completo", "placeholder": "Digite seu nome completo"},
  {"label": "Idade", "placeholder": "Digite sua idade"},
  {"label": "ID do Discord", "placeholder": "Seu ID do Discord"}
]
```

### Tabela: `whitelist_entries`
```sql
- id (VARCHAR PRIMARY KEY)
- license_id (VARCHAR) - FK para licenses.id
- discord_user_id (VARCHAR) - ID do usuário que pediu WL
- discord_username (VARCHAR) - Nome do usuário
- answers (JSON) - Respostas às perguntas
- status (ENUM) - 'pending', 'approved', 'denied'
- reviewed_by (VARCHAR) - ID de quem aprovou/negou
- reviewed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Tabela: `validation_logs`
```sql
- id (VARCHAR PRIMARY KEY)
- license_id (VARCHAR) - FK para licenses.id
- ip_address (VARCHAR) - IP que tentou validar
- success (BOOLEAN) - Se validação teve sucesso
- error_message (TEXT) - Mensagem de erro se falhou
- created_at (TIMESTAMP)
```

## VARIÁVEIS DE AMBIENTE

### Dashboard (Vercel) - `.env.local` ou Vercel Environment Variables:
```env
DATABASE_URL="mysql://WLbot:2006@45.146.81.87:3306/nexvo_bot_wl"
DISCORD_CLIENT_ID="1455112417456554014"
DISCORD_CLIENT_SECRET="PQsaRHR5DH9jzp9LQMObXl6x3drgpstI"
DISCORD_REDIRECT_URI="https://bot-wal.vercel.app/api/auth/callback"
NEXTAUTH_SECRET="NEXVO_A_MELHOR_LOJA"
NEXTAUTH_URL="https://bot-wal.vercel.app"
BOT_API_SECRET="5e3709c45ff97ac192107af871d00f201a2fe7a17e70f9444348ba19da836687"
```

### Bot (Cliente) - `bot/.env`:
```env
LICENSE_KEY="WL-CHAVE-GERADA"
DISCORD_BOT_TOKEN="TOKEN_DO_BOT_DO_CLIENTE"
API_URL="https://bot-wal.vercel.app"
```

## ESTRUTURA DE ARQUIVOS DO PROJETO

### Dashboard (Next.js)
```
/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts - Autenticação NextAuth com Discord OAuth2
│   │   ├── admin/
│   │   │   └── create-license/route.ts - API para criar licenças
│   │   ├── bot/
│   │   │   ├── validate/route.ts - Valida licença e IP do bot
│   │   │   ├── heartbeat/route.ts - Recebe heartbeat do bot
│   │   │   └── config/route.ts - Retorna configurações do bot
│   │   ├── licenses/
│   │   │   ├── configure-vps/route.ts - Configura IP da VPS
│   │   │   ├── configure-bot/route.ts - Salva config do bot
│   │   │   └── check-ip/route.ts - Verifica se IP está disponível
│   ├── dashboard/
│   │   ├── page.tsx - Dashboard do usuário
│   │   ├── admin/page.tsx - Painel admin para criar licenças
│   │   └── licenses/[id]/
│   │       ├── page.tsx - Detalhes e configuração da licença
│   │       └── logs/page.tsx - Logs de validação
│   ├── page.tsx - Homepage com login
│   ├── layout.tsx - Layout principal com SessionProvider
│   ├── providers.tsx - Provider do NextAuth
│   └── globals.css - Estilos globais Tailwind
├── components/
│   ├── ui/ - Componentes shadcn/ui (button, card, input, etc.)
│   ├── license-card.tsx - Card de licença no dashboard
│   ├── create-license-form.tsx - Formulário de criar licença
│   ├── configure-vps-form.tsx - Formulário de configurar VPS
│   └── bot-config-form.tsx - Formulário de config do bot
├── lib/
│   ├── db.ts - Conexão MySQL e função queryDb
│   ├── auth.ts - Funções auxiliares de autenticação
│   └── bot-auth.ts - Validação de autenticação do bot
├── types/
│   └── next-auth.d.ts - Tipagem estendida do NextAuth
├── scripts/
│   ├── 001-create-tables.sql - Cria todas as tabelas
│   └── 002-add-admin-column.sql - Adiciona coluna is_admin
├── .env.local - Variáveis de ambiente (local)
└── package.json
```

### Bot Discord (Node.js)
```
bot/
├── index.js - Código principal do bot
├── package.json
├── .env - Variáveis de ambiente
└── README.md - Instruções de instalação
```

## ENDPOINTS DA API

### Autenticação

**GET /api/auth/[...nextauth]**
- NextAuth handlers para Discord OAuth2
- Login, callback, session, signout

### Admin (Requer isAdmin = true)

**POST /api/admin/create-license**
```json
Request:
{
  "discordId": "662055385187745821",
  "planType": "lifetime"
}

Response:
{
  "success": true,
  "license": {
    "id": "uuid",
    "licenseKey": "WL-ABC123-DEF456",
    "userId": "uuid",
    "planType": "lifetime"
  }
}
```

### Bot APIs (Requer BOT_API_SECRET no header)

**POST /api/bot/validate**
```json
Request:
{
  "licenseKey": "WL-ABC123-DEF456",
  "vpsIp": "45.123.456.789"
}

Response:
{
  "success": true,
  "valid": true,
  "licenseId": "uuid"
}
```

**POST /api/bot/heartbeat**
```json
Request:
{
  "licenseKey": "WL-ABC123-DEF456"
}

Response:
{
  "success": true
}
```

**GET /api/bot/config?licenseKey=WL-ABC123-DEF456**
```json
Response:
{
  "success": true,
  "config": {
    "guildId": "123456789",
    "whitelistChannelId": "987654321",
    "approvedChannelId": "111222333",
    "deniedChannelId": "444555666",
    "adminRoleId": "777888999",
    "embedColor": "#5865F2",
    "welcomeMessage": "Bem-vindo!",
    "questions": [...]
  }
}
```

### Licenças (Requer autenticação)

**POST /api/licenses/configure-vps**
```json
Request:
{
  "licenseId": "uuid",
  "vpsIp": "45.123.456.789"
}

Response:
{
  "success": true,
  "message": "VPS configurada com sucesso"
}
```

**POST /api/licenses/configure-bot**
```json
Request:
{
  "licenseId": "uuid",
  "config": {
    "guildId": "123456789",
    "whitelistChannelId": "987654321",
    "questions": [...]
  }
}

Response:
{
  "success": true,
  "message": "Configuração salva"
}
```

## CÓDIGO DO BOT DISCORD

### Funcionalidades do Bot:

1. **Validação de Licença**
   - Ao iniciar, valida licença com a API
   - Verifica se IP da VPS está correto
   - Se inválido, bot não inicia

2. **Heartbeat Automático**
   - A cada 5 minutos envia ping para API
   - Atualiza last_heartbeat no banco
   - Permite monitorar bots online

3. **Sistema de Whitelist**
   - Comando `/whitelist` abre formulário modal
   - Usuário responde perguntas personalizadas
   - Admin recebe embed com respostas
   - Admin aprova/nega com botões

4. **Comandos Slash**
   - `/whitelist` - Abre formulário de whitelist
   - `/status` - Mostra status da licença
   - `/config` - Recarrega configurações

### Estrutura do bot/index.js:

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Validação inicial
async function validateLicense() {
  // Faz POST /api/bot/validate
  // Se falhar, process.exit(1)
}

// Heartbeat
setInterval(async () => {
  // POST /api/bot/heartbeat a cada 5min
}, 5 * 60 * 1000);

// Carregar config
async function loadConfig() {
  // GET /api/bot/config
  // Retorna configurações do banco
}

// Comando /whitelist
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'whitelist') {
    // Mostra modal com perguntas
    // Salva respostas no banco
    // Envia embed para canal de admin
  }
});

// Botões de aprovar/negar
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('approve_')) {
      // Aprova whitelist
      // Atualiza banco
      // Envia mensagem no canal de aprovados
    }
    if (interaction.customId.startsWith('deny_')) {
      // Nega whitelist
      // Atualiza banco
      // Envia mensagem no canal de negados
    }
  }
});
```

## FLUXO DE AUTENTICAÇÃO NEXTAUTH

1. **Usuário clica em "Acessar Painel"**
2. **Redireciona para Discord OAuth2**
   - URL: `discord.com/api/oauth2/authorize`
   - Scopes: identify, email
   - Redirect: `https://bot-wal.vercel.app/api/auth/callback`

3. **Discord retorna para /api/auth/callback**
4. **NextAuth callback signIn():**
   - Verifica se usuário existe no banco (discord_id)
   - Se não existe: INSERT INTO users
   - Se existe: UPDATE users (atualiza username, avatar, etc.)

5. **NextAuth callback jwt():**
   - Adiciona discordId ao token JWT
   - Busca is_admin no banco
   - Adiciona isAdmin ao token

6. **NextAuth callback session():**
   - Copia dados do token para session
   - session.user.isAdmin disponível no frontend/backend
   - session.user.discordId, session.user.id, etc.

7. **Usuário autenticado**
   - Pode acessar /dashboard
   - Se isAdmin = true, pode acessar /dashboard/admin

## SEGURANÇA

### Proteção de IP (Anti-compartilhamento)
- Licença vinculada a 1 IP específico
- Bot só funciona naquele IP
- Tentativas de outros IPs são logadas em validation_logs
- Cliente não pode trocar IP sozinho (precisa contato com admin)

### Validação de Licença
- Licença tem status (active, expired, suspended)
- Bot verifica status a cada inicialização
- Heartbeat confirma que bot está rodando
- Se heartbeat > 10min, licença pode ser suspensa

### Autenticação de APIs
- Endpoints do bot requerem header `x-bot-secret`
- Valor deve ser igual a BOT_API_SECRET do .env
- Previne acesso não autorizado às APIs internas

### Discord OAuth2
- NextAuth gerencia sessões de forma segura
- JWT armazenado em cookies HTTP-only
- Session expira após inatividade
- Refresh tokens gerenciados automaticamente

## TROUBLESHOOTING COMUM

### Problema: isAdmin está undefined
**Solução:**
1. Verificar se `is_admin = 1` no banco de dados
2. Fazer logout e login novamente para renovar sessão
3. Verificar logs do Vercel no callback jwt()
4. Confirmar que queryDb está funcionando

### Problema: Bot não valida licença
**Solução:**
1. Verificar se LICENSE_KEY no .env está correto
2. Confirmar que vps_ip no banco está correto
3. Checar se BOT_API_SECRET está igual no dashboard e bot
4. Ver logs de validation_logs no banco

### Problema: 404 em /dashboard/admin
**Solução:**
1. Confirmar que is_admin = 1 no banco
2. Fazer logout e login novamente
3. Verificar se página não está redirecionando (ver logs)
4. Acessar /api/debug-session para ver sessão

### Problema: Database connection failed
**Solução:**
1. Verificar se MySQL está rodando na VPS
2. Confirmar credenciais em DATABASE_URL
3. Testar conexão com HeidiSQL
4. Verificar se porta 3306 está aberta

### Problema: CORS error no Discord OAuth2
**Solução:**
1. Verificar DISCORD_REDIRECT_URI no .env
2. Adicionar redirect URI no Discord Developer Portal
3. Confirmar que domínio está correto (https://bot-wal.vercel.app)

## MANUTENÇÃO E OPERAÇÃO

### Como Criar Nova Licença:
1. Acesse https://bot-wal.vercel.app/dashboard/admin
2. Cole o Discord ID do comprador
3. Escolha o tipo de plano
4. Clique em "Criar Licença"
5. Copie a chave gerada
6. Envie para o cliente

### Como Cliente Ativa Licença:
1. Cliente acessa https://bot-wal.vercel.app
2. Faz login com Discord
3. Vai em "Minhas Licenças"
4. Cola a chave de licença
5. Configura IP da VPS
6. Configura perguntas e canais
7. Baixa bot e roda na VPS

### Como Monitorar Licenças:
1. Dashboard admin mostra total e ativas
2. Ver last_heartbeat para saber se bot está online
3. Acessar validation_logs para ver tentativas de uso
4. Filtrar por status (active, expired, suspended)

### Como Suspender Licença:
```sql
UPDATE licenses SET status = 'suspended' WHERE license_key = 'WL-CHAVE';
```
Bot não vai mais validar e para de funcionar.

### Como Renovar Licença:
```sql
UPDATE licenses SET expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = 'uuid';
```

### Backup do Banco:
```bash
mysqldump -u WLbot -p nexvo_bot_wl > backup.sql
```

### Restaurar Banco:
```bash
mysql -u WLbot -p nexvo_bot_wl < backup.sql
```

## MELHORIAS FUTURAS SUGERIDAS

1. **Sistema de Pagamentos**
   - Integrar Stripe/MercadoPago
   - Compra automática de licenças
   - Renovação automática

2. **Painel de Estatísticas**
   - Gráficos de uso por licença
   - Whitelists aprovadas/negadas
   - Uptime dos bots

3. **Notificações**
   - Email quando licença expira
   - Discord webhook de novas vendas
   - Alerta de bot offline

4. **Multi-idioma**
   - Português, Inglês, Espanhol
   - Configurável por licença

5. **Sistema de Tickets**
   - Suporte integrado no dashboard
   - Cliente abre ticket direto

## CREDENCIAIS E ACESSOS

### Discord Developer Portal
- Application ID: 1455112417456554014
- Client Secret: PQsaRHR5DH9jzp9LQMObXl6x3drgpstI
- Redirect URI: https://bot-wal.vercel.app/api/auth/callback

### Vercel
- Projeto: bot-wal
- URL: https://bot-wal.vercel.app
- Git: Conectado ao repositório

### VPS MySQL
- Host: 45.146.81.87
- Port: 3306
- User: WLbot
- Password: 2006
- Database: nexvo_bot_wl

### Seu Discord ID (Admin)
- ID: 662055385187745821
- is_admin: 1

## COMANDOS ÚTEIS

### Desenvolvimento Local:
```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

### Deploy no Vercel:
```bash
# Vercel faz deploy automático do Git
# Ou use: vercel deploy
```

### Rodar Bot Localmente:
```bash
cd bot
npm install
node index.js
```

### Ver Logs do Vercel:
```bash
vercel logs
# Ou pelo dashboard do Vercel
```

### Testar API:
```bash
curl -X POST https://bot-wal.vercel.app/api/bot/validate \
  -H "Content-Type: application/json" \
  -H "x-bot-secret: SUA_SECRET" \
  -d '{"licenseKey":"WL-TESTE","vpsIp":"1.2.3.4"}'
```

## RESUMO RÁPIDO - TUDO QUE VOCÊ PRECISA SABER

**Você é o ADMIN:**
- Acesse https://bot-wal.vercel.app/dashboard/admin
- Crie licenças para clientes
- Monitore uso e heartbeats

**Cliente compra:**
1. Recebe chave de licença
2. Faz login no site com Discord
3. Ativa licença e configura
4. Baixa bot e roda na VPS dele

**Bot funciona assim:**
- Valida licença + IP na inicialização
- Carrega config do banco automaticamente
- Usuários usam /whitelist
- Admin aprova/nega com botões
- Bot envia heartbeat a cada 5min

**Tecnologias:**
- Frontend: Next.js 16 + React 19 + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes + NextAuth
- Database: MySQL (VPS 45.146.81.87)
- Bot: Discord.js v14 + Node.js
- Deploy: Vercel (dashboard) + VPS cliente (bot)

**Estado Atual:**
- Dashboard funcionando em produção
- Autenticação Discord OAuth2 OK
- Sistema de licenças completo
- Bot pronto para distribuição
- Banco de dados configurado
- Tudo hospedado e operacional

FIM DO RESUMO COMPLETO
```

```md file="" isHidden
