# 🚀 GUIA DE INÍCIO RÁPIDO (5 MINUTOS)

## ⚡ Começar Agora

### Passo 1: Preparar (.env.local)
```bash
# Crie o arquivo na raiz do projeto:
# c:\Users\ls852\Downloads\discord-bot-creation\.env.local

DATABASE_URL=mysql://vercel_user:Senha123!@45.146.81.87:3306/nexvo_bot_wl
NEXTAUTH_SECRET=seu_secret_super_secreto_12345
NEXTAUTH_URL=http://localhost:3000
DISCORD_ID=seu_discord_app_id
DISCORD_SECRET=seu_discord_app_secret
```

### Passo 2: Instalar Dependências
```bash
cd c:\Users\ls852\Downloads\discord-bot-creation
pnpm install
```

### Passo 3: Rodar Frontend
```bash
# Terminal 1: Frontend
pnpm dev

# Deve aparecer:
# ➜  Local:   http://localhost:3000
# ➜  press h + enter to show help
```

### Passo 4: Acessar
Abra navegador: **http://localhost:3000**

Você verá:
- Botão "Entrar com Discord"
- Clique e autorize a aplicação
- Pronto! 🎉

---

## 🧪 Testar Tudo (2 minutos)

### Terminal 2: Rodar Testes
```bash
pnpm test:all

# Vai rodar:
# - 15 testes Jest
# - 12 testes Playwright
# Total: 27 testes ✓
```

**Resultado esperado:**
```
Test Suites: 3 passed, 3 total
Tests: 27 passed, 27 total
```

---

## 🤖 Rodar Bot (Opcional)

### Terminal 3: Bot Local
```bash
cd bot
npm install
npm start

# Bot deve se conectar ao Discord
# E fazer POST /api/bot/validate
```

---

## 📊 Acessar Dashboards

### Admin Dashboard
URL: **http://localhost:3000/dashboard/admin**

Se Discord ID for `662055385187745821`:
- Automaticamente vê admin panel
- Pode criar/gerenciar licenças
- Pode ver logs

### Client Dashboard
URL: **http://localhost:3000/dashboard**

Para qualquer usuário:
- Ver suas licenças
- Configurar VPS
- Configurar bot
- Gerenciar questões

---

## 🎯 Teste Rápido: Criar Licença

### 1. Admin Create
1. Vá para http://localhost:3000/dashboard/admin
2. Clique "Criar Nova Licença"
3. Preencha:
   - Nome cliente: "Meu Servidor"
   - Tipo plano: "professional"
   - Validade: 12 meses
4. Clique "Criar"
5. ✓ Licença deve aparecer na lista!

### 2. Ver nos Logs
1. Vá para http://localhost:3000/dashboard/admin/logs
2. Veja a ação "license_created"
3. Clique "Exportar CSV" para baixar

---

## 📁 Arquivos Importantes

### Para Começar
```
.env.local                      ← Suas variáveis
package.json                    ← Scripts
app/dashboard/page.tsx          ← Cliente dashboard
app/dashboard/admin/page.tsx    ← Admin dashboard
```

### Para Entender
```
DOCUMENTACAO_COMPLETA.md        ← Referência
TESTES_GUIA.md                  ← Tests
README_PROJETO.md               ← Overview
CHECKLIST_FINAL.md              ← Checklist
```

---

## 🐛 Se Algo Não Funcionar

### Erro: "Database connection failed"
```bash
# Verificar:
1. DATABASE_URL correto em .env.local?
2. VPS MySQL está rodando? (XAMPP services)
3. Pode fazer ping? ping 45.146.81.87
4. Credenciais vercel_user/Senha123! corretas?
```

### Erro: "NEXTAUTH_SECRET not found"
```bash
# Solução:
1. Adicione ao .env.local:
   NEXTAUTH_SECRET=qualquer_string_aqui
2. Restart server: Ctrl+C e pnpm dev
```

### Erro: "Discord login não funciona"
```bash
# Verificar:
1. DISCORD_ID correto?
2. DISCORD_SECRET correto?
3. Autorizado em Discord Dev Portal?
```

---

## ✨ O Que Você Pode Fazer Agora

### Admin
- ✅ Criar licenças ilimitadas
- ✅ Gerenciar licenses (suspender, ativar, deletar)
- ✅ Ver todos os logs
- ✅ Filtrar e exportar logs

### Cliente
- ✅ Ver suas licenças
- ✅ Configurar VPS onde bot roda
- ✅ Configurar bot (guild, roles, channels)
- ✅ Criar questões de whitelist
- ✅ Gerenciar perguntas

### Bot
- ✅ Validar license ao iniciar
- ✅ Enviar heartbeat a cada 5 minutos
- ✅ Processar respostas de whitelist
- ✅ Receber ordem para parar

---

## 📊 Arquitetura Visual

```
                    Você (Localhost)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
    Frontend (localhost:3000)    Backend APIs
    ├─ /dashboard              ├─ /api/admin/*
    ├─ /dashboard/admin        ├─ /api/bot/*
    └─ /dashboard/admin/logs   └─ /api/licenses/*
                                      │
                                      ▼
                             MySQL Database
                             45.146.81.87:3306
                             nexvo_bot_wl
```

---

## 🎓 Documentação

| Arquivo | Propósito |
|---------|-----------|
| **README_PROJETO.md** | Overview + features |
| **DOCUMENTACAO_COMPLETA.md** | API reference + database |
| **TESTES_GUIA.md** | Como rodar testes |
| **CHECKLIST_FINAL.md** | Checklist completo |
| **RESUMO_ENTREGA.md** | Resumo visual |

---

## 🚀 Deploy (Depois)

### Frontend para Vercel
```bash
# 1. Push para GitHub
git push

# 2. Vercel auto-deploy
# 3. Adicione env vars em Vercel dashboard
# 4. URL: https://bot-wal.vercel.app
```

### Bot para VPS
```bash
# SSH para VPS e rodar:
cd bot
npm install
pm2 start index.js --name "nexvo-bot"
```

---

## 📞 Dúvidas Rápidas

**P: Onde está o bot rodando?**
R: Em `/bot/index.js`. Para desenvolver localmente, rode ele também.

**P: Posso criar múltiplas licenças?**
R: Sim! Sem limite. Cada uma tem chave única.

**P: Como o bot sabe qual é sua license?**
R: Via variável `NEXVO_LICENSE_KEY` no `.env` do bot.

**P: E se a license expirar?**
R: Bot faz heartbeat a cada 5 min e verifica. Se expirou, para.

**P: Posso exportar os logs?**
R: Sim! Em `/dashboard/admin/logs` tem botão "Exportar CSV".

---

## 🎁 Comandos Úteis

```bash
# Rodar tudo
pnpm dev                # Frontend
npm start (em bot/)     # Bot
pnpm test:all          # Todos testes

# Testes individuais
pnpm test              # Jest
pnpm test:e2e          # Playwright
pnpm test:coverage     # Com cobertura

# Linting
pnpm lint

# Build produção
pnpm build
pnpm start
```

---

## ✅ Checklist Setup

- [ ] .env.local criado com variáveis
- [ ] pnpm install completado
- [ ] pnpm dev rodando (localhost:3000)
- [ ] Consegue fazer login com Discord
- [ ] Admin dashboard acessível
- [ ] Testes passando (pnpm test:all)
- [ ] Bot rodando (npm start em /bot)

---

## 🎉 Pronto!

Você tem um sistema completo e funcional!

**Próximos passos:**
1. Explore dashboards
2. Crie uma licença teste
3. Configure bot teste
4. Adicione questões
5. Rode testes para verificar

---

**Criado:** Janeiro 2, 2026  
**Status:** ✅ Pronto para usar  
**Tempo estimado:** 5 minutos

### Bora colocar em produção! 🚀

