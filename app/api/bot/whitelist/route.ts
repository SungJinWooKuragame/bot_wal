import { queryDb } from "@/lib/db"
import { logAction } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { licenseKey, userId, username, answers } = await request.json()

    if (!licenseKey || !userId || !username || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Buscar licença
    const [license] = await queryDb<{
      id: string
      user_id: string
      status: string
    }>("SELECT id, user_id, status FROM licenses WHERE license_key = ?", [
      licenseKey,
    ])

    if (!license || license.status !== "active") {
      return NextResponse.json(
        { error: "Invalid or inactive license" },
        { status: 403 }
      )
    }

    // Buscar perguntas
    const questions = await queryDb<{
      id: string
      question_type: string
      options: string | null
    }>(
      "SELECT id, question_type, options FROM license_questions WHERE license_id = ?",
      [license.id]
    )

    // Calcular pontuação
    let score = 0
    let maxScore = 0

    questions.forEach((question) => {
      maxScore += 1

      if (question.question_type === "select") {
        const options = JSON.parse(question.options || "[]")
        const userAnswer = answers[question.id]

        const selectedOption = options.find((o: any) => o.value === userAnswer)
        if (selectedOption?.correct) {
          score += 1
        }
      } else {
        // Outras tipos de pergunta contam como certo se respondidas
        if (answers[question.id]) {
          score += 1
        }
      }
    })

    const scorePercentage = maxScore > 0 ? (score / maxScore) * 100 : 0

    // Criar entrada de whitelist
    const entryId = require("crypto").randomUUID()
    await queryDb(
      `INSERT INTO whitelist_entries 
       (id, license_id, discord_user_id, discord_username, answers, status, score) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entryId,
        license.id,
        userId,
        username,
        JSON.stringify(answers),
        "pending",
        Math.round(scorePercentage),
      ]
    )

    // Registrar ação
    await logAction(license.user_id, "whitelist_submission", {
      discordUserId: userId,
      discordUsername: username,
      score: Math.round(scorePercentage),
      maxScore: 100,
    }, license.id)

    return NextResponse.json({
      success: true,
      entryId,
      score: Math.round(scorePercentage),
      maxScore: 100,
      message: `Respostas recebidas! Pontuação: ${Math.round(scorePercentage)}%`,
    })
  } catch (error: any) {
    console.error("[Whitelist] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
