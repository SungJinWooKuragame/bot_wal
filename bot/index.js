const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ApplicationCommandOptionType,
} = require("discord.js")
const fetch = require("node-fetch")

// Configuração
const BOT_VERSION = "2.0.0"
const API_URL = process.env.API_URL || "https://seu-dashboard.vercel.app"
const LICENSE_KEY = process.env.LICENSE_KEY
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

if (!LICENSE_KEY || !DISCORD_TOKEN) {
  console.error("[BOT] Erro: LICENSE_KEY e DISCORD_TOKEN são obrigatórios")
  process.exit(1)
}

// Cliente Discord
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
})

// Autenticação e configuração
let botConfig = null
let isAuthenticated = false
let vpsIp = null

// Perguntas da whitelist
const QUESTIONS = [
  {
    id: "nome",
    question: "Qual é o seu nome In-Game?",
    type: "text",
    validate: (answer) =>
      /^[a-zA-ZÀ-ÿ\s]{2,30}$/.test(answer)
        ? { isValid: true }
        : { isValid: false, error: "Nome deve ter entre 2-30 caracteres (apenas letras e espaços)" },
  },
  {
    id: "idade",
    question: "Qual é a sua idade?",
    type: "text",
    validate: (answer) => {
      const age = Number.parseInt(answer)
      return age >= 16 && age <= 99 ? { isValid: true } : { isValid: false, error: "Idade deve ser entre 16 e 99 anos" }
    },
  },
  {
    id: "roleplay",
    question: "O que significa Roleplay (RP)?",
    type: "select",
    options: [
      { label: "Interpretar um personagem como na vida real", value: "correct", correct: true },
      { label: "Jogar para ganhar a qualquer custo", value: "wrong1", correct: false },
      { label: "Matar outros jogadores sem motivo", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "RP é interpretar um personagem" },
  },
  {
    id: "powergaming",
    question: "O que é Power Gaming?",
    type: "select",
    options: [
      { label: "Abusar das mecânicas do jogo para vantagens", value: "correct", correct: true },
      { label: "Jogar com intensidade total", value: "wrong1", correct: false },
      { label: "Pedir ajuda à staff durante um RP", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "PG é abusar das mecânicas do jogo" },
  },
  {
    id: "metagaming",
    question: "O que é Meta Gaming?",
    type: "select",
    options: [
      { label: "Usar informações externas dentro do RP", value: "correct", correct: true },
      { label: "Criar uma nova meta para o servidor", value: "wrong1", correct: false },
      { label: "Usar hacks para trapacear", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "Meta é usar informação externa no RP" },
  },
  {
    id: "antirp",
    question: "O que é Anti RP?",
    type: "select",
    options: [
      { label: "Violar regras ou leis de discriminação", value: "correct", correct: true },
      { label: "Ficar offline durante uma sessão", value: "wrong1", correct: false },
      { label: "Ficar parado sem interagir", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "Anti RP é violar regras do servidor" },
  },
  {
    id: "deathmatch",
    question: "O que é RDM (Random Deathmatch)?",
    type: "select",
    options: [
      { label: "Matar alguém sem motivo válido", value: "correct", correct: true },
      { label: "Matar como parte de uma história", value: "wrong1", correct: false },
      { label: "Matar NPCs", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "RDM é matar sem motivo válido" },
  },
  {
    id: "vdm",
    question: "O que é VDM (Vehicle Deathmatch)?",
    type: "select",
    options: [
      { label: "Matar alguém com veículo propositalmente", value: "correct", correct: true },
      { label: "Acidentalmente bater o carro", value: "wrong1", correct: false },
      { label: "Dirigir de forma incorreta", value: "wrong2", correct: false },
    ],
    validate: (value) =>
      value === "correct" ? { isValid: true } : { isValid: false, error: "VDM é matar propositalmente com veículo" },
  },
]

// Progresso dos usuários
const userProgress = new Map()

// Funções auxiliares
async function getVpsIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error("[BOT] Erro ao obter IP da VPS:", error)
    return null
  }
}

async function validateLicense() {
  try {
    console.log("[BOT] Validando licença...")
    
    if (!vpsIp) {
      vpsIp = await getVpsIp()
    }

    if (!vpsIp) {
      console.error("[BOT] ❌ Erro: Não foi possível obter IP da VPS")
      return false
    }

    const response = await fetch(`${API_URL}/api/bot/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: LICENSE_KEY,
        vpsIp: vpsIp,
        botVersion: BOT_VERSION,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      console.error("[BOT] ❌ Validação falhou:", data.error || "Erro desconhecido")
      console.error("[BOT] 🔗 Configure sua licença em:", API_URL)
      return false
    }

    const data = await response.json()

    if (!data.valid) {
      console.error("[BOT] ❌ Licença inválida:", data.error || "Motivo desconhecido")
      return false
    }

    botConfig = data.config
    isAuthenticated = true

    console.log("[BOT] ✅ Licença validada com sucesso!")
    console.log("[BOT] 📊 Status:", data.license.status)
    console.log("[BOT] 📦 Plano:", data.license.plan_type)
    console.log("[BOT] 🌐 VPS IP:", vpsIp)

    // Validar se há configuração
    if (!botConfig.guild_id) {
      console.warn("[BOT] ⚠️  Bot não está configurado! Acesse o dashboard para configurar.")
      console.warn("[BOT] 🔗 Dashboard:", API_URL)
    }

    return true
  } catch (error) {
    console.error("[BOT] ❌ Erro ao validar licença:", error.message)
    return false
  }
}
    vpsIp = await getVpsIp()
    if (!vpsIp) {
      console.error("[BOT] Não foi possível obter o IP da VPS")
      return false
    }

    console.log(`[BOT] Validando licença ${LICENSE_KEY} para IP ${vpsIp}...`)

    const response = await fetch(`${API_URL}/api/bot/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: LICENSE_KEY,
        vpsIp: vpsIp,
        botVersion: BOT_VERSION,
      }),
    })

    const data = await response.json()

    if (data.valid) {
      botConfig = data.config
      isAuthenticated = true
      console.log("[BOT] Licença validada com sucesso!")
      console.log("[BOT] Configuração carregada:", botConfig)
      return true
    } else {
      console.error("[BOT] Licença inválida:", data.error)
      return false
    }
  } catch (error) {
    console.error("[BOT] Erro ao validar licença:", error)
    return false
  }
}

async function sendHeartbeat() {
  if (!isAuthenticated) {
    console.log("[BOT] Heartbeat ignorado: bot não autenticado")
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/bot/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: LICENSE_KEY,
        vpsIp: vpsIp,
        stats: {
          uptime: process.uptime(),
          guilds: client.guilds.cache.size,
          users: client.users.cache.size,
        },
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      console.error("[BOT] ❌ Heartbeat falhou:", data.error)

      // Se shouldStop=true, significa que a licença foi suspensa/expirada
      if (data.shouldStop) {
        console.error("[BOT] 🛑 Licença inválida! Bot será encerrado.")
        console.error("[BOT] 🔗 Verifique sua licença em:", API_URL)
        process.exit(1)
      }
      return
    }

    const data = await response.json()
    console.log("[BOT] 💓 Heartbeat enviado:", data.timestamp)
  } catch (error) {
    console.error("[BOT] ⚠️  Erro ao enviar heartbeat:", error.message)
    // Não encerra o bot em caso de erro de rede temporário
  }
}

async function registerCommands() {
  const commands = [
    {
      name: "whitelist",
      description: "Iniciar processo de whitelist",
    },
    {
      name: "config",
      description: "Ver configuração atual (apenas admin)",
    },
  ]

  try {
    await client.application.commands.set(commands)
    console.log("[BOT] Comandos registrados!")
  } catch (error) {
    console.error("[BOT] Erro ao registrar comandos:", error)
  }
}

// Eventos
client.once("ready", async () => {
  console.log(`[BOT] Conectado como ${client.user.tag}`)

  // Validar licença
  const isValid = await validateLicense()
  if (!isValid) {
    console.error("[BOT] Falha na validação. Encerrando...")
    process.exit(1)
  }

  // Registrar comandos
  await registerCommands()

  // Iniciar heartbeat a cada 5 minutos
  setInterval(sendHeartbeat, 5 * 60 * 1000)

  console.log("[BOT] Bot pronto para uso!")
})

client.on("interactionCreate", async (interaction) => {
  try {
    if (!isAuthenticated) {
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "Bot não autenticado. Verifique a licença.",
          ephemeral: true,
        })
      }
      return
    }

    // Comando /whitelist
    if (interaction.isCommand() && interaction.commandName === "whitelist") {
      const userId = interaction.user.id

      // Inicializar progresso do usuário
      userProgress.set(userId, {
        currentQuestion: 0,
        answers: {},
        startedAt: Date.now(),
      })

      await sendQuestion(interaction, userId)
      return
    }

    // Comando /config (apenas admin)
    if (interaction.isCommand() && interaction.commandName === "config") {
      if (!interaction.memberPermissions.has("Administrator")) {
        await interaction.reply({
          content: "Apenas administradores podem ver a configuração",
          ephemeral: true,
        })
        return
      }

      const configEmbed = new EmbedBuilder()
        .setTitle("Configuração do Bot")
        .setColor(botConfig?.embed_color || "#0099ff")
        .addFields(
          { name: "Guild ID", value: botConfig?.guild_id || "Não configurado", inline: true },
          { name: "Cargo Whitelist", value: botConfig?.whitelist_role_id || "Não configurado", inline: true },
          { name: "Canal Logs", value: botConfig?.log_channel_id || "Não configurado", inline: true },
          { name: "Canal Aceitos", value: botConfig?.accept_channel_id || "Não configurado", inline: true },
          { name: "Canal Reprovados", value: botConfig?.reprove_channel_id || "Não configurado", inline: true },
        )
        .setFooter({ text: `Bot v${BOT_VERSION} | Licença ativa` })

      await interaction.reply({ embeds: [configEmbed], ephemeral: true })
      return
    }

    // Respostas de select menu
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("wl_answer_")) {
      const userId = interaction.user.id
      const progress = userProgress.get(userId)

      if (!progress) {
        await interaction.reply({
          content: "Sua sessão expirou. Use /whitelist para começar novamente.",
          ephemeral: true,
        })
        return
      }

      const question = QUESTIONS[progress.currentQuestion]
      const selectedValue = interaction.values[0]

      // Validar resposta
      const validation = question.validate(selectedValue)

      if (!validation.isValid) {
        await interaction.reply({
          content: `Resposta incorreta: ${validation.error}\nTente novamente.`,
          ephemeral: true,
        })
        return
      }

      // Salvar resposta
      progress.answers[question.id] = selectedValue

      // Próxima pergunta ou finalizar
      progress.currentQuestion++
      await interaction.deferUpdate()

      if (progress.currentQuestion < QUESTIONS.length) {
        await sendQuestion(interaction, userId, true)
      } else {
        await finishWhitelist(interaction, userId)
      }
    }

    // Modal submit (para perguntas de texto)
    if (interaction.isModalSubmit() && interaction.customId.startsWith("wl_modal_")) {
      const userId = interaction.user.id
      const progress = userProgress.get(userId)

      if (!progress) {
        await interaction.reply({
          content: "Sua sessão expirou. Use /whitelist para começar novamente.",
          ephemeral: true,
        })
        return
      }

      const question = QUESTIONS[progress.currentQuestion]
      const answer = interaction.fields.getTextInputValue("answer")

      // Validar resposta
      const validation = question.validate(answer)

      if (!validation.isValid) {
        await interaction.reply({
          content: `Resposta inválida: ${validation.error}\nTente novamente com /whitelist`,
          ephemeral: true,
        })
        userProgress.delete(userId)
        return
      }

      // Salvar resposta
      progress.answers[question.id] = answer

      // Próxima pergunta ou finalizar
      progress.currentQuestion++
      await interaction.deferUpdate()

      if (progress.currentQuestion < QUESTIONS.length) {
        await sendQuestion(interaction, userId, true)
      } else {
        await finishWhitelist(interaction, userId)
      }
    }
  } catch (error) {
    console.error("[BOT] Erro ao processar interação:", error)
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Ocorreu um erro ao processar sua solicitação.",
        ephemeral: true,
      })
    }
  }
})

async function sendQuestion(interaction, userId, isFollowUp = false) {
  const progress = userProgress.get(userId)
  const question = QUESTIONS[progress.currentQuestion]

  const embed = new EmbedBuilder()
    .setTitle(`Whitelist - Pergunta ${progress.currentQuestion + 1}/${QUESTIONS.length}`)
    .setDescription(question.question)
    .setColor(botConfig?.embed_color || "#0099ff")
    .setFooter({ text: "Responda corretamente para continuar" })

  if (question.type === "select") {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`wl_answer_${userId}`)
      .setPlaceholder("Selecione sua resposta")

    for (const option of question.options) {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder().setLabel(option.label).setValue(option.value).setEmoji("📝"),
      )
    }

    const row = new ActionRowBuilder().addComponents(selectMenu)

    if (isFollowUp) {
      await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true })
    } else {
      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
    }
  } else {
    // Para perguntas de texto, criar modal
    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

    const modal = new ModalBuilder().setCustomId(`wl_modal_${userId}`).setTitle(question.question.substring(0, 45))

    const input = new TextInputBuilder()
      .setCustomId("answer")
      .setLabel(question.question)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100)

    const row = new ActionRowBuilder().addComponents(input)
    modal.addComponents(row)

    await interaction.showModal(modal)
  }
}

async function finishWhitelist(interaction, userId) {
  const progress = userProgress.get(userId)
  const user = await client.users.fetch(userId)

  // Criar embed com as respostas
  const embed = new EmbedBuilder()
    .setTitle("Whitelist Aprovada!")
    .setDescription(botConfig?.welcome_message?.replace("{user}", user.username) || "Bem-vindo ao servidor!")
    .setColor(botConfig?.embed_color || "#0099ff")
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: "Nome In-Game", value: progress.answers.nome || "N/A", inline: true },
      { name: "Idade", value: progress.answers.idade || "N/A", inline: true },
      { name: "Discord", value: user.tag, inline: true },
    )
    .setTimestamp()

  // Dar cargo de whitelist
  if (botConfig?.whitelist_role_id) {
    try {
      const member = await interaction.guild.members.fetch(userId)
      await member.roles.add(botConfig.whitelist_role_id)
      console.log(`[BOT] Cargo de whitelist dado para ${user.tag}`)
    } catch (error) {
      console.error("[BOT] Erro ao dar cargo:", error)
    }
  }

  // Enviar para canal de aceitos
  if (botConfig?.accept_channel_id) {
    try {
      const channel = await client.channels.fetch(botConfig.accept_channel_id)
      await channel.send({ embeds: [embed] })
    } catch (error) {
      console.error("[BOT] Erro ao enviar para canal de aceitos:", error)
    }
  }

  // Enviar para canal de logs
  if (botConfig?.log_channel_id) {
    try {
      const logChannel = await client.channels.fetch(botConfig.log_channel_id)
      const logEmbed = new EmbedBuilder()
        .setTitle("Nova Whitelist Aprovada")
        .setColor("#00ff00")
        .addFields(
          { name: "Usuário", value: user.tag, inline: true },
          { name: "ID", value: userId, inline: true },
          { name: "Nome In-Game", value: progress.answers.nome || "N/A", inline: false },
        )
        .setTimestamp()

      await logChannel.send({ embeds: [logEmbed] })
    } catch (error) {
      console.error("[BOT] Erro ao enviar log:", error)
    }
  }

  await interaction.followUp({
    content: "Parabéns! Sua whitelist foi aprovada!",
    embeds: [embed],
    ephemeral: true,
  })

  userProgress.delete(userId)
}

// Login
client.login(DISCORD_TOKEN).catch((error) => {
  console.error("[BOT] Erro ao fazer login:", error)
  process.exit(1)
})

// Tratamento de erros
process.on("unhandledRejection", (error) => {
  console.error("[BOT] Unhandled promise rejection:", error)
})

process.on("uncaughtException", (error) => {
  console.error("[BOT] Uncaught exception:", error)
  process.exit(1)
})
