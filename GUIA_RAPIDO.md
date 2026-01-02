# GUIA RÁPIDO DE USO - Bot de Whitelist FiveM

## VOCÊ (ADMIN) - Como Criar e Vender Licenças

### 1. Acesse o Painel Admin
```
URL: https://bot-wal.vercel.app/dashboard/admin
```

### 2. Criar Nova Licença
1. Cole o Discord ID do comprador (exemplo: 662055385187745821)
2. Escolha o tipo de plano:
   - **Lifetime (Vitalício)** - Nunca expira
   - **Monthly (Mensal)** - 30 dias
   - **Yearly (Anual)** - 365 dias
3. Clique em "Criar Licença"
4. Copie a chave gerada (exemplo: WL-ABC123-DEF456)
5. Envie para o cliente

### 3. Entregar ao Cliente
Envie para o cliente:
- A chave de licença
- Link do site: https://bot-wal.vercel.app
- Instruções: "Faça login com Discord e cole a chave"

---

## CLIENTE - Como Ativar e Usar

### 1. Ativar Licença no Site
1. Acesse https://bot-wal.vercel.app
2. Clique em "Acessar Painel"
3. Faça login com Discord
4. Cole a chave de licença recebida
5. Configure o IP da sua VPS

### 2. Configurar o Bot
No site, configure:
- **ID do Servidor Discord** - Onde o bot vai funcionar
- **Canal de Pedidos** - Onde usuários vão pedir whitelist
- **Canal de Aprovados** - Onde vão as aprovações
- **Canal de Negados** - Onde vão as negações
- **Role de Admin** - Quem pode aprovar/negar
- **Cor dos Embeds** - Cor das mensagens do bot
- **Perguntas da WL** - O que perguntar aos usuários

### 3. Instalar o Bot na VPS
```bash
# Baixe a pasta do bot
cd bot

# Crie arquivo .env com suas credenciais
nano .env
```

Cole no .env:
```env
LICENSE_KEY=SUA_CHAVE_AQUI
DISCORD_BOT_TOKEN=TOKEN_DO_SEU_BOT
API_URL=https://bot-wal.vercel.app
```

```bash
# Instale dependências
npm install

# Rode o bot
node index.js
```

### 4. Usar o Bot no Discord
- Usuários digitam `/whitelist`
- Preenchem o formulário
- Admin recebe notificação
- Admin aprova/nega com botões

---

## MONITORAMENTO

### Ver Status das Licenças
1. Acesse https://bot-wal.vercel.app/dashboard/admin
2. Veja total de licenças e licenças ativas
3. Verifique último heartbeat (última vez que bot enviou sinal)

### Se Bot Ficar Offline
- Verifique se a VPS está rodando
- Confirme se o processo do bot não foi encerrado
- Veja os logs do bot para erros

---

## TROUBLESHOOTING RÁPIDO

**Bot não inicia:**
- Verifique se LICENSE_KEY está correta no .env
- Confirme que IP da VPS está configurado no site
- Veja se DISCORD_BOT_TOKEN é válido

**Não consigo criar licença:**
- Confirme que você é admin (is_admin = 1 no banco)
- Faça logout e login novamente
- Limpe cache do navegador

**Cliente não consegue ativar:**
- Confirme que a chave foi copiada corretamente
- Verifique se a licença não expirou
- Certifique-se que cliente fez login com Discord correto

---

## CONTATOS E SUPORTE

**Banco de Dados:**
- Host: 45.146.81.87:3306
- Database: nexvo_bot_wl
- User: WLbot

**Site em Produção:**
- URL: https://bot-wal.vercel.app
- Deploy: Automático via Vercel (conectado ao Git)

**Seu Acesso Admin:**
- Discord ID: 662055385187745821
- is_admin: 1

---

## COMANDOS ÚTEIS

### Ver logs no Vercel:
```bash
vercel logs
```

### Backup do banco:
```bash
mysqldump -u WLbot -p nexvo_bot_wl > backup.sql
```

### Suspender uma licença:
```sql
UPDATE licenses SET status = 'suspended' WHERE license_key = 'WL-CHAVE';
```

### Tornar alguém admin:
```sql
UPDATE users SET is_admin = 1 WHERE discord_id = 'DISCORD_ID';
```

---

## RESUMO DO FLUXO

```
VOCÊ (Admin)
   ↓
Cria licença no /dashboard/admin
   ↓
Envia chave para CLIENTE
   ↓
CLIENTE faz login no site
   ↓
CLIENTE ativa licença e configura
   ↓
CLIENTE instala bot na VPS
   ↓
BOT valida com API
   ↓
BOT funciona no servidor Discord
   ↓
USUÁRIOS usam /whitelist
   ↓
ADMIN aprova/nega
```

FIM DO GUIA RÁPIDO
```

```ts file="app/api/debug-session/route.ts" isDeleted="true"
...deleted...
