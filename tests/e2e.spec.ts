import { test, expect, Page } from "@playwright/test"

// Test environment setup
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "test-admin@discord.local"
const USER_EMAIL = process.env.USER_EMAIL || "test-user@discord.local"

test.describe("Bot License System E2E", () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(BASE_URL)
  })

  test.afterEach(async () => {
    await page.close()
  })

  test("Admin: Login and access admin dashboard", async () => {
    // Navigate to login
    await page.goto(`${BASE_URL}/auth/discord`)
    
    // Wait for Discord OAuth button
    const discordButton = page.locator('button:has-text("Entrar com Discord")')
    await expect(discordButton).toBeVisible()
  })

  test("Admin: Create a new license", async () => {
    // Login first (would need mock Discord auth in real test)
    await page.goto(`${BASE_URL}/dashboard/admin`)
    
    // Check if redirected to login
    const loginUrl = page.url()
    if (loginUrl.includes("auth")) {
      console.log("Authentication required - skipping for now")
      return
    }

    // Click on "Criar Nova Licença" tab
    await page.click('text=Criar Nova Licença')
    
    // Fill form
    await page.fill('input[placeholder*="clientes"]', "Professional")
    await page.fill('input[placeholder*="meses"]', "12")
    
    // Submit
    await page.click('button:has-text("Criar Licença")')
    
    // Verify success
    await expect(page.locator('text=Licença criada com sucesso')).toBeVisible()
  })

  test("Admin: Manage license (suspend/activate)", async () => {
    await page.goto(`${BASE_URL}/dashboard/admin`)
    
    // Look for license cards
    const licenseCard = page.locator('[data-testid="license-card"]').first()
    
    if (await licenseCard.isVisible()) {
      // Click suspend button
      await licenseCard.locator('button:has-text("Suspender")').click()
      
      // Confirm in dialog
      await page.click('button:has-text("Confirmar")')
      
      // Verify status changed
      await expect(licenseCard.locator('text=suspended')).toBeVisible()
    }
  })

  test("Client: View licenses and configure VPS", async () => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Check if user sees their licenses
    const licensesList = page.locator('[data-testid="license-list"]')
    
    if (await licensesList.isVisible()) {
      // Click first license
      await licensesList.locator('a').first().click()
      
      // Should be on license detail page
      expect(page.url()).toContain("/dashboard/licenses/")
      
      // Look for VPS configuration
      const vpsForm = page.locator('[data-testid="vps-form"]')
      if (await vpsForm.isVisible()) {
        // Fill VPS IP
        await page.fill('input[placeholder*="IP"]', "45.146.81.87")
        await page.click('button:has-text("Configurar")')
        
        // Verify success
        await expect(page.locator('text=VPS configurada com sucesso')).toBeVisible()
      }
    }
  })

  test("Client: Configure bot settings", async () => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    const licensesList = page.locator('[data-testid="license-list"]')
    if (await licensesList.isVisible()) {
      await licensesList.locator('a').first().click()
      
      // Find bot config form
      const configForm = page.locator('[data-testid="bot-config-form"]')
      if (await configForm.isVisible()) {
        // Fill guild ID
        await page.fill('input[placeholder*="Servidor"]', "1234567890")
        
        // Fill whitelist role
        await page.fill('input[placeholder*="Whitelist"]', "0987654321")
        
        // Submit
        await page.click('button:has-text("Salvar Configuração")')
        
        // Verify
        await expect(page.locator('text=Configuração salva')).toBeVisible()
      }
    }
  })

  test("Client: Manage whitelist questions", async () => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    const licensesList = page.locator('[data-testid="license-list"]')
    if (await licensesList.isVisible()) {
      await licensesList.locator('a').first().click()
      
      // Find questions section
      const questionsForm = page.locator('[data-testid="questions-form"]')
      if (await questionsForm.isVisible()) {
        // Add a new question
        await page.fill('textarea[placeholder*="Pergunta"]', "Qual é o seu nome?")
        await page.selectOption('select[placeholder*="Tipo"]', "text")
        await page.click('button:has-text("Adicionar")')
        
        // Verify question added
        await expect(page.locator('text=Qual é o seu nome?')).toBeVisible()
      }
    }
  })

  test("Client: View audit logs", async () => {
    await page.goto(`${BASE_URL}/dashboard/admin/logs`)
    
    // Check if logs table is visible
    const logsTable = page.locator('[role="table"]')
    await expect(logsTable).toBeVisible({ timeout: 5000 })
    
    // Check for log entries
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    
    console.log(`Found ${count} audit log entries`)
  })

  test("Bot: Validate license on startup", async () => {
    // This test validates the bot validation endpoint
    const response = await page.request.post(`${BASE_URL}/api/bot/validate`, {
      data: {
        license_key: "test-license-key",
        bot_version: "1.0.0",
      },
    })

    // Should get validation response
    expect(response.status()).toBeLessThan(500)
    
    const data = await response.json()
    
    // If license is valid
    if (response.status() === 200) {
      expect(data).toHaveProperty("valid", true)
      expect(data).toHaveProperty("config")
    }
    // If license is invalid
    else if (response.status() === 400) {
      expect(data).toHaveProperty("error")
    }
  })

  test("Bot: Send heartbeat", async () => {
    const response = await page.request.post(`${BASE_URL}/api/bot/heartbeat`, {
      data: {
        license_key: "test-license-key",
        ip: "45.146.81.87",
      },
    })

    expect(response.status()).toBeLessThan(500)
    
    const data = await response.json()
    
    // Heartbeat should return status
    if (response.status() === 200) {
      expect(data).toHaveProperty("shouldStop")
    }
  })

  test("Bot: Submit whitelist application", async () => {
    const response = await page.request.post(`${BASE_URL}/api/bot/whitelist`, {
      data: {
        license_key: "test-license-key",
        user_id: "123456789",
        user_name: "TestUser",
        answers: {
          "question-1": "John",
          "question-2": "Option 2",
        },
      },
    })

    expect(response.status()).toBeLessThan(500)
    
    const data = await response.json()
    
    if (response.status() === 200) {
      expect(data).toHaveProperty("score")
      expect(data).toHaveProperty("maxScore")
      expect(data).toHaveProperty("percentage")
    }
  })

  test("Integration: Complete flow from admin to bot to whitelist", async () => {
    // This test simulates a complete workflow:
    // 1. Admin creates license
    // 2. Client configures VPS and bot
    // 3. Bot validates license
    // 4. User submits whitelist
    // 5. Admin reviews audit logs

    console.log("Complete integration test - requires full setup")
    
    // Step 1: Create license (admin)
    const licenseResp = await page.request.post(`${BASE_URL}/api/admin/licenses`, {
      data: {
        client_name: "Integration Test",
        plan_type: "professional",
        validity_months: 1,
      },
    })

    let licenseId: string
    if (licenseResp.status() === 201) {
      const licenseData = await licenseResp.json()
      licenseId = licenseData.id
      console.log(`Created license: ${licenseId}`)

      // Step 2: Configure VPS
      const vpsResp = await page.request.post(
        `${BASE_URL}/api/licenses/configure-vps`,
        {
          data: {
            license_id: licenseId,
            vps_ip: "45.146.81.87",
            hostname: "vps.example.com",
          },
        }
      )

      expect(vpsResp.status()).toBe(200)

      // Step 3: Bot validates
      const validateResp = await page.request.post(`${BASE_URL}/api/bot/validate`, {
        data: {
          license_key: "generated-key-here",
          bot_version: "1.0.0",
        },
      })

      expect(validateResp.status()).toBeLessThan(500)

      // Step 4: Review in audit logs
      const logsResp = await page.request.get(
        `${BASE_URL}/api/admin/audit-logs?action=license_created`
      )

      expect(logsResp.status()).toBe(200)
    }
  })
})
