"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddSectionButtonProps {
  pageId: string
  onAddSection: (pageId: string) => void
}

const AddSectionButton = ({ pageId, onAddSection }: AddSectionButtonProps) => {
  return (
    <Button variant="outline" className="w-full mb-4 border-dashed" onClick={() => onAddSection(pageId)}>
      <Plus size={16} className="mr-2" /> Add Section
    </Button>
  )
}

export default AddSectionButton
