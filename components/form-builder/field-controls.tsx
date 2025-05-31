"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"
import { useFieldOperations } from "@/hooks/use-field-operations"

interface FieldControlsProps {
  fieldId: string
  sectionId: string
  onFieldsChanged: () => void
  onDeleteField?: (fieldId: string) => void
  isFirst?: boolean
  isLast?: boolean
}

export function FieldControls({
  fieldId,
  sectionId,
  onFieldsChanged,
  onDeleteField,
  isFirst = false,
  isLast = false,
}: FieldControlsProps) {
  const { moveFieldUp, moveFieldDown, isMoving } = useFieldOperations(sectionId, onFieldsChanged)

  return (
    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={isFirst || isMoving}
        onClick={() => moveFieldUp(fieldId)}
        aria-label="Move field up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={isLast || isMoving}
        onClick={() => moveFieldDown(fieldId)}
        aria-label="Move field down"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

      {onDeleteField && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onDeleteField(fieldId)}
          aria-label="Delete field"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
