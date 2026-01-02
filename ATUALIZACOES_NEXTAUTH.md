# Atualizações NextAuth - Sistema Completo

## O que foi feito:

### 1. NextAuth Configurado
- Criado `/app/api/auth/[...nextauth]/route.ts` com DiscordProvider
- Callbacks implementados para salvar/atualizar usuário no MySQL
- Session JWT configurada com ID do Discord e dados do banco

### 2. Arquivos Atualizados

**app/layout.tsx**
- Adicionado SessionProvider para toda aplicação
- Título atualizado

**app/providers.tsx** (novo)
- Client component com SessionProvider do NextAuth

**types/next-auth.d.ts** (novo)
- Tipos TypeScript customizados para session com ID, discordId, isAdmin

**app/page.tsx**
- Usa `useSession()` do NextAuth para verificar login
- Usa `signIn("discord")` para login

**app/dashboard/page.tsx**
- Usa `getServerSession(authOptions)` server-side
- Busca licenças pelo session.user.id
- Link de logout para `/api/auth/signout`

**app/dashboard/admin/page.tsx**
- Verifica `session.user.isAdmin` para permitir acesso
- Usa getServerSession

### 3. Arquivos Removidos (antigos)
- `/app/api/auth/callback/route.ts`
- `/app/api/auth/check/route.ts`
- `/app/api/auth/discord/route.ts`

## Como funciona agora:

1. Usuário clica em "Acessar Dashboard"
2. NextAuth redireciona para Discord OAuth
3. Discord autoriza e volta para `/api/auth/callback`
4. NextAuth callback salva/atualiza usuário no MySQL
5. Session criada com JWT contendo ID do banco
6. Usuário redirecionado para `/dashboard`

## Variáveis de ambiente necessárias:

\`\`\`
DISCORD_CLIENT_ID=1455112417456554014
DISCORD_CLIENT_SECRET=PQsaRHR5DH9jzp9LQMObXl6x3drgpstI
NEXTAUTH_URL=https://bot-wal.vercel.app
NEXTAUTH_SECRET=NEXVO_A_MELHOR_LOJA
DATABASE_URL=mysql://WLbot:2006@45.146.81.87:3306/nexvo_bot_wl
BOT_API_SECRET=5e3709c45ff97ac192107af871d00f201a2fe7a17e70f9444348ba19da836687
\`\`\`

## Para virar admin:

Após fazer login uma vez, rode no HeidiSQL:

\`\`\`sql
UPDATE users SET is_admin = 1 WHERE discord_id = 'SEU_DISCORD_ID';
\`\`\`

## Pronto!

Agora o sistema usa NextAuth corretamente. Faça deploy no Vercel e teste.
