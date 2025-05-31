"use client"

import { useState } from "react"
import { FormSaveService } from "@/services/form-save-service"
import { useToast } from "@/hooks/use-toast"

export function useFieldOperations(sectionId: string, onFieldsChanged?: () => void) {
  const [isMoving, setIsMoving] = useState(false)
  const { toast } = useToast()

  // Move a field up in the order
  const moveFieldUp = async (fieldId: string) => {
    if (isMoving) return

    setIsMoving(true)
    try {
      const result = await FormSaveService.moveFieldUp(sectionId, fieldId)

      if (result.success) {
        onFieldsChanged?.()
      } else {
        toast({
          title: "Couldn't move field up",
          description: result.errors?.[0] || "The field is already at the top",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error moving field up:", error)
      toast({
        title: "Error moving field",
        description: "There was a problem moving the field up",
        variant: "destructive",
      })
    } finally {
      setIsMoving(false)
    }
  }

  // Move a field down in the order
  const moveFieldDown = async (fieldId: string) => {
    if (isMoving) return

    setIsMoving(true)
    try {
      const result = await FormSaveService.moveFieldDown(sectionId, fieldId)

      if (result.success) {
        onFieldsChanged?.()
      } else {
        toast({
          title: "Couldn't move field down",
          description: result.errors?.[0] || "The field is already at the bottom",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error moving field down:", error)
      toast({
        title: "Error moving field",
        description: "There was a problem moving the field down",
        variant: "destructive",
      })
    } finally {
      setIsMoving(false)
    }
  }

  // Reorder all fields at once (for drag and drop)
  const reorderFields = async (fieldIds: string[]) => {
    if (isMoving) return

    setIsMoving(true)
    try {
      const result = await FormSaveService.reorderFields(sectionId, fieldIds)

      if (result.success) {
        onFieldsChanged?.()
      } else {
        toast({
          title: "Couldn't reorder fields",
          description: result.errors?.[0] || "There was a problem reordering the fields",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error reordering fields:", error)
      toast({
        title: "Error reordering fields",
        description: "There was a problem reordering the fields",
        variant: "destructive",
      })
    } finally {
      setIsMoving(false)
    }
  }

  return {
    moveFieldUp,
    moveFieldDown,
    reorderFields,
    isMoving,
  }
}
