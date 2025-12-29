// Biblioteca para o bot Discord usar
// Este arquivo deve ser copiado para o projeto do bot

interface ValidationResponse {
  valid: boolean
  error?: string
  license?: {
    id: string
    status: string
    plan_type: string
  }
  config?: {
    guild_id: string | null
    whitelist_role_id: string | null
    log_channel_id: string | null
    accept_channel_id: string | null
    reprove_channel_id: string | null
    embed_color: string
    welcome_message: string | null
  }
}

export class BotAuth {
  private apiUrl: string
  private licenseKey: string
  private vpsIp: string | null = null
  private isValid = false
  private config: any = null

  constructor(apiUrl: string, licenseKey: string) {
    this.apiUrl = apiUrl
    this.licenseKey = licenseKey
  }

  async validate(botVersion?: string): Promise<boolean> {
    try {
      // Pegar IP da VPS
      if (!this.vpsIp) {
        this.vpsIp = await this.getVpsIp()
      }

      const response = await fetch(`${this.apiUrl}/api/bot/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey: this.licenseKey,
          vpsIp: this.vpsIp,
          botVersion,
        }),
      })

      const data: ValidationResponse = await response.json()

      if (data.valid) {
        this.isValid = true
        this.config = data.config
        console.log("[BOT AUTH] License validated successfully")
        return true
      } else {
        this.isValid = false
        console.error("[BOT AUTH] License validation failed:", data.error)
        return false
      }
    } catch (error) {
      console.error("[BOT AUTH] Validation error:", error)
      this.isValid = false
      return false
    }
  }

  async startHeartbeat(intervalMinutes = 5) {
    // Enviar heartbeat a cada X minutos
    setInterval(
      async () => {
        if (!this.isValid) return

        try {
          await fetch(`${this.apiUrl}/api/bot/heartbeat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              licenseKey: this.licenseKey,
              vpsIp: this.vpsIp,
              stats: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
              },
            }),
          })
        } catch (error) {
          console.error("[BOT AUTH] Heartbeat error:", error)
        }
      },
      intervalMinutes * 60 * 1000,
    )
  }

  async getConfig() {
    if (this.config) {
      return this.config
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/bot/config?licenseKey=${this.licenseKey}`)
      const data = await response.json()
      this.config = data.config
      return this.config
    } catch (error) {
      console.error("[BOT AUTH] Config fetch error:", error)
      return null
    }
  }

  private async getVpsIp(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error("[BOT AUTH] Failed to get VPS IP:", error)
      throw new Error("Failed to get VPS IP")
    }
  }

  getIsValid(): boolean {
    return this.isValid
  }
}
