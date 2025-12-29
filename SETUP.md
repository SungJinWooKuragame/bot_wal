# Guia Completo de Instalação

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
3. [Deploy do Dashboard](#deploy-do-dashboard)
4. [Configuração do Bot Discord](#configuração-do-bot-discord)
5. [Primeiro Uso](#primeiro-uso)

---

## Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- MySQL/MariaDB (HeidiSQL ou similar)
- VPS Linux para rodar o bot
- Aplicação Discord (Discord Developer Portal)

---

## Configuração do Banco de Dados

### 1. Criar Database

No HeidiSQL ou phpMyAdmin, crie um novo banco de dados:

```sql
CREATE DATABASE fivem_wl_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Executar Scripts SQL

Execute os scripts na ordem:

1. `scripts/001-create-tables.sql` - Criar todas as tabelas
2. `scripts/002-add-admin-column.sql` - Adicionar coluna de admin

### 3. Tornar seu usuário Admin

Após fazer login pela primeira vez no dashboard, execute:

```sql
UPDATE users SET is_admin = TRUE WHERE discord_id = 'SEU_DISCORD_ID';
```

---

## Deploy do Dashboard

### 1. Conectar GitHub ao Vercel

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "Add New Project"
4. Importe o repositório

### 2. Configurar Variáveis de Ambiente

No Vercel, adicione as seguintes variáveis:

```env
# Database
DB_HOST=seu-host-mysql.com
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=fivem_wl_bot

# Discord OAuth
DISCORD_CLIENT_ID=seu_client_id
DISCORD_CLIENT_SECRET=seu_client_secret
DISCORD_REDIRECT_URI=https://seu-dashboard.vercel.app/api/auth/callback
```

### 3. Obter Credenciais Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá em "OAuth2" > "General"
4. Copie o Client ID e Client Secret
5. Em "Redirects", adicione: `https://seu-dashboard.vercel.app/api/auth/callback`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde a conclusão
3. Acesse a URL do projeto

---

## Configuração do Bot Discord

### 1. Criar Bot no Discord

1. No [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecione sua aplicação
3. Vá em "Bot" e clique em "Add Bot"
4. Ative as seguintes intents:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
5. Copie o token do bot

### 2. Preparar VPS

```bash
# Conectar na VPS
ssh root@seu-ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Criar diretório do bot
mkdir /root/fivem-wl-bot
cd /root/fivem-wl-bot
```

### 3. Upload dos Arquivos

Faça upload dos arquivos da pasta `bot/` para `/root/fivem-wl-bot`

### 4. Configurar Bot

```bash
# Criar arquivo .env
nano .env

# Adicionar configurações:
DISCORD_TOKEN=seu_token_do_bot
LICENSE_KEY=sua_chave_de_licenca
API_URL=https://seu-dashboard.vercel.app

# Salvar: Ctrl+O, Enter, Ctrl+X
```

### 5. Instalar e Executar

```bash
# Instalar dependências
npm install

# Testar
node index.js

# Se funcionou, rodar com PM2
pm2 start index.js --name fivem-wl-bot
pm2 save
pm2 startup
```

---

## Primeiro Uso

### 1. Criar Licença

1. Acesse o dashboard: `https://seu-dashboard.vercel.app`
2. Faça login com Discord
3. Verifique se você é admin (executou UPDATE no SQL)
4. Vá em `/dashboard/admin`
5. Crie uma nova licença
6. Copie a chave gerada

### 2. Vincular Licença

1. Vá em "Dashboard" > "Minhas Licenças"
2. Clique em "Gerenciar" na licença
3. Configure o IP da VPS
4. Configure os canais e cargos do Discord
5. Salve as configurações

### 3. Convidar Bot

1. No Discord Developer Portal, vá em "OAuth2" > "URL Generator"
2. Selecione os scopes: `bot`, `applications.commands`
3. Selecione as permissões:
   - View Channels
   - Send Messages
   - Embed Links
   - Manage Messages
   - Manage Roles
4. Copie o link gerado e abra no navegador
5. Adicione o bot ao seu servidor

### 4. Testar

1. No Discord, use `/whitelist`
2. Responda as perguntas
3. Verifique se o cargo foi dado
4. Confira os logs no dashboard

---

## Troubleshooting

### Bot não conecta

- Verifique se o token está correto
- Confirme que as intents estão ativadas
- Veja os logs: `pm2 logs fivem-wl-bot`

### Licença inválida

- Confirme que o IP da VPS está correto
- Verifique se a licença está ativa no dashboard
- Veja os logs de validação no dashboard

### Dashboard não carrega

- Verifique as variáveis de ambiente no Vercel
- Confirme que o banco de dados está acessível
- Veja os logs no Vercel

### Banco de dados não conecta

- Verifique as credenciais
- Confirme que o host permite conexões externas
- Teste a conexão com HeidiSQL

---

## Suporte

Em caso de problemas, verifique:

1. Logs do bot: `pm2 logs fivem-wl-bot`
2. Logs do dashboard: Vercel > Seu Projeto > Logs
3. Logs de validação: Dashboard > Licença > Ver Logs
