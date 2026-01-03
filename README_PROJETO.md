# 🤖 Bot de Whitelist com Sistema de Licensing

Sistema completo de licensing e whitelist para bots Discord com dashboard de admin.

## ✨ Features

- 🔐 **Admin Dashboard** - Gerenciar licenças, suspender/ativar, ver logs
- 🎫 **License System** - Keys únicas, validação de IP, expiração automática
- ⚙️ **Bot Config** - Configurar Guild ID, roles, channels, cores
- ❓ **Whitelist Questions** - Perguntas customizáveis, múltipla escolha, pontuação
- 📊 **Audit Logs** - Rastrear todas as ações do sistema
- 💾 **Database** - MySQL com schema otimizado
- 🧪 **Testes E2E** - Playwright + Jest, cobertura completa
- 🚀 **Deploy Pronto** - Vercel + VPS Windows

## 🚀 Quick Start

### 1. Clonar Repositório
```bash
git clone https://github.com/SungJinWooKuragame/bot_wal.git
cd bot_wal
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Variáveis de Ambiente
```bash
# Copiar template
cp .env.example .env.local

# Editar com suas credenciais
NEXTAUTH_SECRET=seu_secret_super_secreto
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=mysql://vercel_user:Senha123!@45.146.81.87:3306/nexvo_bot_wl
DISCORD_ID=seu_discord_app_id
DISCORD_SECRET=seu_discord_app_secret
```

### 4. Preparar Database
```bash
# Se novo setup, executar scripts em ordem:
mysql -h 45.146.81.87 -u vercel_user -pSenha123! nexvo_bot_wl < scripts/001-create-tables.sql
mysql -h 45.146.81.87 -u vercel_user -pSenha123! nexvo_bot_wl < scripts/002-add-admin-column.sql
mysql -h 45.146.81.87 -u vercel_user -pSenha123! nexvo_bot_wl < scripts/003-add-whitelist-and-audit.sql
```

### 5. Rodar Localmente
```bash
# Terminal 1: Frontend
pnpm dev
# Acessa: http://localhost:3000

# Terminal 2: Bot
cd bot
npm install
npm start
```

### 6. Fazer Login
- Acesse http://localhost:3000
- Clique "Entrar com Discord"
- Autorize a aplicação
- Pronto! 🎉

## 📊 Dashboard

### Admin (/dashboard/admin)
- Ver todas as licenças de clientes
- Criar nova licença
- Suspender/Ativar/Expirar licenças
- Ver logs de auditoria

### Cliente (/dashboard)
- Ver suas licenças
- Configurar VPS IP
- Configurar bot (guild, roles, channels)
- Gerenciar questões de whitelist
- Ver logs de validação

## 🧪 Testes

```bash
# Todos os testes
pnpm test:all

# Ou individualmente:
pnpm test              # Jest - APIs
pnpm test:e2e          # Playwright - Interface
pnpm test:coverage     # Com relatório de cobertura
```

## 📁 Estrutura

```
├── app/                     # Next.js Frontend
│   ├── api/                 # API Routes
│   └── dashboard/           # Pages do dashboard
├── bot/                     # Node.js Bot
│   └── index.js
├── components/              # React Components
├── lib/                     # Utilidades
├── tests/                   # Testes automatizados
├── scripts/                 # SQL schemas
└── DOCUMENTACAO_COMPLETA.md # Docs detalhada
```

## 🔗 Endpoints Principais

### Admin
- `POST /api/admin/licenses` - Criar licença
- `GET /api/admin/licenses` - Listar todas
- `POST /api/admin/licenses/[id]/action` - Gerenciar
- `GET /api/admin/audit-logs` - Ver logs

### Bot
- `POST /api/bot/validate` - Validar na startup
- `POST /api/bot/heartbeat` - Health check (5min)
- `POST /api/bot/whitelist` - Submeter respostas

### Cliente
- `GET /api/licenses/[id]/questions` - Obter questões
- `POST /api/licenses/[id]/questions` - Adicionar questão

## 🐛 Troubleshooting

### Bot não conecta
```bash
# Verificar VPS
mysql -h 45.146.81.87 -u vercel_user -pSenha123! -e "SELECT 1"
```

### Admin não aparece
```bash
# Atualizar banco (substitua UUID)
UPDATE users SET is_admin=1 WHERE discord_id='seu_discord_id';
```

### Testes falhando
```bash
# Certificar que dev server está rodando
pnpm dev
# E em outro terminal
pnpm test
```

## 📚 Documentação Completa

Ver [DOCUMENTACAO_COMPLETA.md](./DOCUMENTACAO_COMPLETA.md) para:
- Database schema detalhado
- Todos os endpoints com exemplos
- Fluxos de autenticação
- Security features
- Deploy em produção

Ver [TESTES_GUIA.md](./TESTES_GUIA.md) para:
- Como rodar testes
- Cobertura esperada
- Debugging de testes
- CI/CD integration

## 🌐 Deploy

### Vercel (Frontend)
1. Push para GitHub
2. Conectar repo em [vercel.com](https://vercel.com)
3. Adicionar env vars
4. Deploy automático a cada push

### VPS (Bot)
```bash
# 1. SSH para VPS
ssh user@45.146.81.87

# 2. Clonar/atualizar código
git clone ... 
cd bot

# 3. Instalar e rodar com PM2
npm install
pm2 start index.js --name "nexvo-bot" --watch
pm2 startup
pm2 save
```

## 📱 Features em Detalhe

### License Management
- Keys únicas geradas automaticamente
- Vinculação a IP específico (VPS)
- Expiração automática
- Suspensão/Ativação instantânea
- Heartbeat detec mudanças

### Whitelist Questions
- Tipos: texto, textarea, multipla escolha, número, email
- Reordenar via drag-and-drop
- Marcar como obrigatória
- Preview em tempo real

### Audit Logs
- Rastreia todas as ações
- Filtro por ação/data/usuário
- Export CSV
- IP registrado

### Security
- OAuth2 Discord
- JWT sessions com revalidação
- Admin check no middleware
- Validação de license antes de usar

## 🎯 Próximos Passos

- [ ] Two-factor auth
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] API webhook

## 📞 Contato

- GitHub: https://github.com/SungJinWooKuragame/bot_wal
- Database: mysql://vercel_user:Senha123!@45.146.81.87:3306/nexvo_bot_wl

## 📄 Licença

MIT

---

**Status:** ✅ Pronto para produção
**Última atualização:** Janeiro 2026
**Versão:** 1.0.0
