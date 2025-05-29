"use client"

import { useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { Question } from "./types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, GripVertical, Plus } from "lucide-react"

interface SectionProps {
  id: string
  index: number
  title: string
  questions: Question[]
  moveQuestion: (
    dragIndex: number,
    hoverIndex: number,
    sourceSectionId: string,
    targetSectionId: string,
    pageId: string,
  ) => void
  moveSection: (dragIndex: number, hoverIndex: number, pageId: string) => void
  addQuestion: (sectionId: string, type: any, pageId: string) => void
  updateQuestionText: (questionId: string, newText: string, sectionId: string, pageId: string) => void
  updateSectionTitle: (sectionId: string, newTitle: string, pageId: string) => void
  deleteQuestion: (questionId: string, sectionId: string, pageId: string) => void
  deleteSection: (sectionId: string, pageId: string) => void
  pageId: string
}

const Section = ({
  id,
  index,
  title,
  questions,
  moveQuestion,
  moveSection,
  addQuestion,
  updateQuestionText,
  updateSectionTitle,
  deleteQuestion,
  deleteSection,
  pageId,
}: SectionProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)

  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "SECTION",
    hover(item: any, monitor) {
      if (!item) return
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      moveSection(dragIndex, hoverIndex, pageId)
      item.index = hoverIndex
    },
  })

  const handleSaveSectionTitle = () => {
    updateSectionTitle(id, editTitle, pageId)
    setIsEditing(false)
  }

  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id} className="flex items-center gap-2 p-2 mb-2 border rounded-md bg-white">
        <GripVertical className="cursor-move" size={16} />
        <Input
          value={question.text}
          onChange={(e) => updateQuestionText(question.id, e.target.value, id, pageId)}
          className="flex-1"
        />
        <div className="text-sm text-gray-500">{question.type}</div>
        <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id, id, pageId)}>
          <Trash2 size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          {isEditing ? (
            <div className="flex gap-2 items-center flex-1">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={handleSaveSectionTitle}>
                Save
              </Button>
            </div>
          ) : (
            <CardTitle className="text-lg font-medium cursor-pointer" onClick={() => setIsEditing(true)}>
              {title}
            </CardTitle>
          )}
          <Button variant="ghost" size="sm" onClick={() => deleteSection(id, pageId)}>
            <Trash2 size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          {questions.map((question, idx) => renderQuestion(question, idx))}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => addQuestion(id, "text", pageId)}>
            <Plus size={16} className="mr-1" /> Add Question
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Section
