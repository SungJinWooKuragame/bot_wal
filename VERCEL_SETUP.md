# Configuração no Vercel - Passo a Passo

## 1. Adicionar Variáveis de Ambiente

Acesse: https://vercel.com/[seu-usuario]/bot-wal/settings/environment-variables

Adicione EXATAMENTE essas variáveis (copie e cole):

### Variável 1:
**Name:** `DATABASE_URL`  
**Value:** `mysql://WLbot:2006@45.146.81.87:3306/nexvo_bot_wl`

### Variável 2:
**Name:** `DISCORD_CLIENT_ID`  
**Value:** `1455112417456554014`

### Variável 3:
**Name:** `DISCORD_CLIENT_SECRET`  
**Value:** `PQsaRHR5DH9jzp9LQMObXl6x3drgpstI`

### Variável 4:
**Name:** `DISCORD_REDIRECT_URI`  
**Value:** `https://bot-wal.vercel.app/api/auth/callback`

### Variável 5:
**Name:** `NEXTAUTH_SECRET`  
**Value:** `NEXVO_A_MELHOR_LOJA`

### Variável 6:
**Name:** `NEXTAUTH_URL`  
**Value:** `https://bot-wal.vercel.app`

### Variável 7:
**Name:** `BOT_API_SECRET`  
**Value:** `5e3709c45ff97ac192107af871d00f201a2fe7a17e70f9444348ba19da836687`

## 2. Aplicar em Todos os Ambientes

Para cada variável, certifique-se de marcar:
- ✅ Production
- ✅ Preview
- ✅ Development

## 3. Redeploy

Após adicionar TODAS as variáveis, vá em:
- Deployments
- Clique nos 3 pontinhos no último deploy
- Clique em "Redeploy"

## 4. Discord Developer Portal

Acesse: https://discord.com/developers/applications/1455112417456554014/oauth2

Em **Redirects**, adicione:
```
https://bot-wal.vercel.app/api/auth/callback
```

Clique em "Save Changes"

## 5. Verificar Configuração

Após o redeploy, acesse:
```
https://bot-wal.vercel.app/api/check-env
```

Deve mostrar todas as variáveis como `true`

## 6. Testar Login

Agora acesse:
```
https://bot-wal.vercel.app
```

Clique em "Acessar Dashboard" e faça login com Discord
