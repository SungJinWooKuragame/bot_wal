# FiveM Whitelist Bot v2.0

Bot modernizado de whitelist para servidores FiveM com sistema de licenciamento.

## Instalação

### 1. Requisitos

- Node.js v18 ou superior
- NPM ou Yarn
- VPS Linux (Ubuntu/Debian recomendado)

### 2. Configurar o Bot

\`\`\`bash
# 1. Fazer upload dos arquivos para a VPS
cd /root
mkdir fivem-wl-bot
cd fivem-wl-bot

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
nano .env

# Preencher:
# - DISCORD_TOKEN: Token do bot (Discord Developer Portal)
# - LICENSE_KEY: Chave fornecida no dashboard
# - API_URL: URL do seu dashboard (ex: https://seu-bot.vercel.app)
\`\`\`

### 3. Obter Token do Discord

1. Acesse https://discord.com/developers/applications
2. Crie uma nova aplicação
3. Vá em "Bot" e clique em "Add Bot"
4. Copie o token e cole no `.env`
5. Ative as intents necessárias:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### 4. Convidar o Bot

Use o link gerado no dashboard ou crie um manualmente:

\`\`\`
https://discord.com/api/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=268445760&scope=bot%20applications.commands
\`\`\`

### 5. Executar o Bot

\`\`\`bash
# Teste
node index.js

# Produção (com PM2)
npm install -g pm2
pm2 start index.js --name fivem-wl-bot
pm2 save
pm2 startup
\`\`\`

## Comandos

- `/whitelist` - Iniciar processo de whitelist
- `/config` - Ver configuração atual (apenas admin)

## Configuração

Todas as configurações são feitas pelo dashboard web:

1. Acesse o dashboard com sua conta Discord
2. Vá em "Minhas Licenças"
3. Clique em "Gerenciar" na licença
4. Configure:
   - IP da VPS
   - ID do servidor Discord
   - Canais e cargos
   - Mensagens personalizadas

## Suporte

Em caso de problemas:

1. Verifique se a licença está ativa no dashboard
2. Confirme que o IP da VPS está correto
3. Verifique os logs: `pm2 logs fivem-wl-bot`
4. Entre em contato com o suporte

## Atualizações

O bot verifica automaticamente por atualizações. Para atualizar manualmente:

\`\`\`bash
git pull
npm install
pm2 restart fivem-wl-bot
