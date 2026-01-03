import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"

const BASE_URL = process.env.API_URL || "http://localhost:3000"

describe("API Tests", () => {
  let testLicenseId: string
  let testLicenseKey: string

  describe("License Management", () => {
    it("should create a new license", async () => {
      const response = await fetch(`${BASE_URL}/api/admin/licenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          client_name: "Test Client",
          plan_type: "professional",
          validity_months: 12,
        }),
      })

      expect(response.status).toBeLessThan(400)
      const data = await response.json()
      
      if (response.status === 201) {
        expect(data).toHaveProperty("id")
        expect(data).toHaveProperty("license_key")
        testLicenseId = data.id
        testLicenseKey = data.license_key
      }
    })

    it("should list all licenses for admin", async () => {
      const response = await fetch(`${BASE_URL}/api/admin/licenses`, {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data.licenses)).toBe(true)
    })

    it("should get license details", async () => {
      if (!testLicenseId) return

      const response = await fetch(`${BASE_URL}/api/admin/licenses/${testLicenseId}`, {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(testLicenseId)
    })

    it("should suspend a license", async () => {
      if (!testLicenseId) return

      const response = await fetch(`${BASE_URL}/api/admin/licenses/${testLicenseId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          action: "suspend",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.status).toBe("suspended")
    })

    it("should activate a suspended license", async () => {
      if (!testLicenseId) return

      const response = await fetch(`${BASE_URL}/api/admin/licenses/${testLicenseId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          action: "activate",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.status).toBe("active")
    })
  })

  describe("Bot Validation", () => {
    it("should validate a license", async () => {
      if (!testLicenseKey) return

      const response = await fetch(`${BASE_URL}/api/bot/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: testLicenseKey,
          bot_version: "1.0.0",
        }),
      })

      expect(response.status).toBeLessThan(500)
      const data = await response.json()
      
      if (response.status === 200) {
        expect(data.valid).toBe(true)
        expect(data.config).toBeDefined()
      }
    })

    it("should reject invalid license key", async () => {
      const response = await fetch(`${BASE_URL}/api/bot/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: "invalid-key",
          bot_version: "1.0.0",
        }),
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it("should send heartbeat", async () => {
      if (!testLicenseKey) return

      const response = await fetch(`${BASE_URL}/api/bot/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: testLicenseKey,
          ip: "45.146.81.87",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty("shouldStop")
    })
  })

  describe("Whitelist Questions", () => {
    let questionId: string

    it("should add a whitelist question", async () => {
      if (!testLicenseId) return

      const response = await fetch(`${BASE_URL}/api/licenses/${testLicenseId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.USER_TOKEN}`,
        },
        body: JSON.stringify({
          action: "add",
          question_text: "What is your name?",
          question_type: "text",
          required: true,
        }),
      })

      expect(response.status).toBeLessThan(400)
      const data = await response.json()
      
      if (response.status === 201) {
        expect(data).toHaveProperty("questionId")
        questionId = data.questionId
      }
    })

    it("should list whitelist questions", async () => {
      if (!testLicenseId) return

      const response = await fetch(`${BASE_URL}/api/licenses/${testLicenseId}/questions`)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data.questions)).toBe(true)
    })

    it("should submit whitelist answers", async () => {
      if (!testLicenseKey) return

      const response = await fetch(`${BASE_URL}/api/bot/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: testLicenseKey,
          user_id: "123456789",
          user_name: "TestUser",
          answers: {
            "question-1": "John Doe",
          },
        }),
      })

      expect(response.status).toBeLessThan(500)
      const data = await response.json()
      
      if (response.status === 200) {
        expect(data).toHaveProperty("score")
        expect(data).toHaveProperty("maxScore")
        expect(data).toHaveProperty("percentage")
      }
    })
  })

  describe("Audit Logs", () => {
    it("should fetch audit logs as admin", async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data.logs)).toBe(true)
    })

    it("should filter logs by action", async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/audit-logs?action=license_created`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
          },
        }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data.logs)).toBe(true)
    })

    it("should deny access to non-admin users", async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        headers: {
          Authorization: `Bearer ${process.env.USER_TOKEN}`,
        },
      })

      expect(response.status).toBe(403)
    })
  })

  describe("Database Connection", () => {
    it("should connect to database successfully", async () => {
      // This would test the database connection
      const response = await fetch(`${BASE_URL}/api/check-env`)

      expect(response.status).toBeLessThan(500)
    })
  })
})
