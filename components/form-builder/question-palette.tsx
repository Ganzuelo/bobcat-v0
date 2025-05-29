"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionType } from "./types"

interface QuestionPaletteProps {
  addQuestion: (sectionId: string, type: QuestionType, pageId: string) => void
  selectedPageId: string
}

const QuestionPalette = ({ addQuestion, selectedPageId }: QuestionPaletteProps) => {
  const questionTypes = [
    { type: QuestionType.TEXT, label: "Text" },
    { type: QuestionType.NUMBER, label: "Number" },
    { type: QuestionType.EMAIL, label: "Email" },
    { type: QuestionType.PHONE, label: "Phone" },
    { type: QuestionType.DATE, label: "Date" },
    { type: QuestionType.SELECT, label: "Select" },
    { type: QuestionType.CHECKBOX, label: "Checkbox" },
    { type: QuestionType.RADIO, label: "Radio" },
    { type: QuestionType.TEXTAREA, label: "Text Area" },
    { type: QuestionType.FILE, label: "File Upload" },
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Question Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {questionTypes.map((q) => (
            <Button
              key={q.type}
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                // This is just a placeholder - in a real implementation,
                // we would need to select a section to add the question to
                alert(`Select a section to add ${q.label} question`)
              }}
            >
              {q.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuestionPalette
