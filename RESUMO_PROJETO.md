# RESUMO DO BOT DE WHITELIST FIVEM

## O QUE É
Sistema de bot Discord para whitelist de servidor FiveM com dashboard web e sistema de licenças para venda.

## ESTRUTURA
1. **Dashboard Next.js** (Vercel) - https://bot-wal.vercel.app
2. **Bot Discord** (Node.js) - Roda na VPS do cliente
3. **Banco MySQL** (HeidiSQL) - VPS 45.146.81.87

## COMO FUNCIONA

### VOCÊ (Vendedor):
1. Acessa dashboard como admin
2. Cria licença nova no painel admin
3. Envia chave de licença para o cliente

### CLIENTE (Comprador):
1. Faz login no site com Discord
2. Ativa a licença com a chave
3. Configura IP da VPS dele
4. Configura perguntas do bot e personalização
5. Baixa pasta `/bot` e roda na VPS dele
6. Bot valida licença + IP automaticamente

## SISTEMA DE SEGURANÇA
- Bot só funciona no IP configurado pelo cliente
- Valida licença a cada 5 minutos
- Licença expira na data definida
- Impede uso compartilhado

## ARQUIVOS IMPORTANTES

### Dashboard (Vercel):
- `app/dashboard/page.tsx` - Dashboard do usuário
- `app/dashboard/admin/page.tsx` - Painel admin
- `app/api/auth/` - Autenticação Discord
- `app/api/bot/validate/route.ts` - API validação bot
- `lib/db.ts` - Conexão MySQL

### Bot (Cliente roda na VPS):
- `bot/index.js` - Código principal do bot
- `bot/.env` - Configurações (LICENSE_KEY, BOT_TOKEN)

### Banco de Dados:
- `scripts/001-create-tables.sql` - Criar tabelas
- `scripts/002-add-admin-column.sql` - Adicionar admin

## VARIÁVEIS AMBIENTE (Vercel)
```
DATABASE_URL=mysql://WLbot:2006@45.146.81.87:3306/nexvo_bot_wl
DISCORD_CLIENT_ID=1455112417456554014
DISCORD_CLIENT_SECRET=PQsaRHR5DH9jzp9LQMObXl6x3drgpstI
DISCORD_REDIRECT_URI=https://bot-wal.vercel.app/api/auth/callback
NEXTAUTH_SECRET=NEXVO_A_MELHOR_LOJA
NEXTAUTH_URL=https://bot-wal.vercel.app
BOT_API_SECRET=5e3709c45ff97ac192107af871d00f201a2fe7a17e70f9444348ba19da836687
```

## PROBLEMAS ATUAIS
1. Erro CORS ao clicar em botões - CORRIGIDO (usando window.location)
2. Redirect após login volta pra home em vez do dashboard - EM DEBUG
3. Botão comprar não funciona - precisa criar página

## PRÓXIMOS PASSOS
1. Verificar logs do callback no Vercel
2. Criar página de planos/compra
3. Testar fluxo completo de licença
4. Remover console.log após debug
