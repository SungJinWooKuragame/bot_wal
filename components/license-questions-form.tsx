"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question_text: string
  question_type: "text" | "textarea" | "select" | "number" | "email"
  options?: string
  required: boolean
  sequence: number
}

interface LicenseQuestionsFormProps {
  licenseId: string
}

export function LicenseQuestionsForm({ licenseId }: LicenseQuestionsFormProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "text" as const,
    options: "",
    required: true,
  })

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/licenses/${licenseId}/questions`)
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar questões", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!formData.question_text.trim()) {
      toast({ title: "Erro", description: "Digite a pergunta", variant: "destructive" })
      return
    }

    if (formData.question_type === "select" && !formData.options.trim()) {
      toast({ title: "Erro", description: "Adicione opções para perguntas do tipo Select", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/licenses/${licenseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editing ? "update" : "add",
          id: editing,
          ...formData,
          options: formData.question_type === "select" ? formData.options : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Sucesso", description: editing ? "Questão atualizada" : "Questão adicionada" })
        setFormData({ question_text: "", question_type: "text", options: "", required: true })
        setEditing(null)
        await loadQuestions()
      } else {
        toast({ title: "Erro", description: data.error || "Falha ao salvar", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar questão", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/licenses/${licenseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: questionId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Sucesso", description: "Questão removida" })
        await loadQuestions()
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao deletar questão", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleMoveQuestion = async (questionId: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === questionId)
    if ((direction === "up" && index === 0) || (direction === "down" && index === questions.length - 1)) {
      return
    }

    const newQuestions = [...questions]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    
    // Swap
    [newQuestions[index].sequence, newQuestions[targetIndex].sequence] = [
      newQuestions[targetIndex].sequence,
      newQuestions[index].sequence,
    ]

    try {
      setLoading(true)
      const res = await fetch(`/api/licenses/${licenseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: questionId,
          sequence: newQuestions[index].sequence,
          question_text: questions[index].question_text,
          question_type: questions[index].question_type,
          options: questions[index].options,
          required: questions[index].required,
        }),
      })

      if ((await res.json()).success) {
        await loadQuestions()
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao reordenar", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (question: Question) => {
    setEditing(question.id)
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || "",
      required: question.required,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Gerenciar Questões de Whitelist</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editing ? "Editar" : "Adicionar"} Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pergunta *</Label>
            <Textarea
              placeholder="Digite a pergunta que será exibida aos usuários"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            />
          </div>

          <div>
            <Label>Tipo de Pergunta</Label>
            <Select value={formData.question_type} onValueChange={(value: any) => setFormData({ ...formData, question_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Simples</SelectItem>
                <SelectItem value="textarea">Texto Longo</SelectItem>
                <SelectItem value="select">Múltipla Escolha</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.question_type === "select" && (
            <div>
              <Label>Opções (uma por linha)</Label>
              <Textarea
                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Use | para marcar opção como correta: Opção 1|*</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            />
            <Label htmlFor="required" className="mb-0">Questão obrigatória</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddQuestion} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Atualizar" : "Adicionar"}
            </Button>
            {editing && (
              <Button variant="outline" onClick={() => { setEditing(null); setFormData({ question_text: "", question_type: "text", options: "", required: true }) }}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {questions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma questão adicionada ainda</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={loadQuestions}>
            Carregar Questões
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{question.question_text}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">{question.question_type}</span>
                    {question.required && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Obrigatória</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveQuestion(question.id, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveQuestion(question.id, "down")}
                    disabled={index === questions.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(question)}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Deletar Questão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                          Deletar
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
