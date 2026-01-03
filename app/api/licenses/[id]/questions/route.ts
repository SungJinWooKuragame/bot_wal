import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { queryDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Verificar se licença pertence ao usuário
    const [license] = await queryDb<{ user_id: string }>(
      "SELECT user_id FROM licenses WHERE id = ?",
      [id]
    )

    if (!license || license.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Buscar perguntas
    const questions = await queryDb<{
      id: string
      license_id: string
      question_text: string
      question_type: string
      options: string | null
      required: boolean
      order: number
      created_at: string
    }>(
      `SELECT id, license_id, question_text, question_type, options, required, \`order\`, created_at 
       FROM license_questions 
       WHERE license_id = ? 
       ORDER BY \`order\` ASC`,
      [id]
    )

    return NextResponse.json({
      success: true,
      questions: questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      })),
    })
  } catch (error: any) {
    console.error("[Questions GET] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { action, question } = await request.json()

    // Verificar se licença pertence ao usuário
    const [license] = await queryDb<{ user_id: string }>(
      "SELECT user_id FROM licenses WHERE id = ?",
      [id]
    )

    if (!license || license.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (action === "add") {
      // Adicionar pergunta
      const questionId = require("crypto").randomUUID()
      await queryDb(
        `INSERT INTO license_questions 
         (id, license_id, question_text, question_type, options, required, \`order\`) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          id,
          question.text,
          question.type,
          question.options ? JSON.stringify(question.options) : null,
          question.required ? 1 : 0,
          question.order || 999,
        ]
      )

      return NextResponse.json({
        success: true,
        message: "Pergunta adicionada com sucesso",
        questionId,
      })
    }

    if (action === "update") {
      // Atualizar pergunta
      await queryDb(
        `UPDATE license_questions 
         SET question_text = ?, question_type = ?, options = ?, required = ?, \`order\` = ? 
         WHERE id = ? AND license_id = ?`,
        [
          question.text,
          question.type,
          question.options ? JSON.stringify(question.options) : null,
          question.required ? 1 : 0,
          question.order,
          question.id,
          id,
        ]
      )

      return NextResponse.json({
        success: true,
        message: "Pergunta atualizada com sucesso",
      })
    }

    if (action === "delete") {
      // Deletar pergunta
      await queryDb(
        "DELETE FROM license_questions WHERE id = ? AND license_id = ?",
        [question.id, id]
      )

      return NextResponse.json({
        success: true,
        message: "Pergunta deletada com sucesso",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("[Questions POST] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
