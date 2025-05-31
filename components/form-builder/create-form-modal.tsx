"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FormConfig } from "@/lib/form-templates"

interface CreateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateForm: (formConfig: FormConfig) => void
}

export function CreateFormModal({ open, onOpenChange, onCreateForm }: CreateFormModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [formType, setFormType] = useState<"uad_3_6" | "uad_2_6" | "bpo" | "other">("other")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateForm({
      title,
      description,
      formType,
    })
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setFormType("other")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Create a new form from scratch or use a template.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter form title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Form Type</Label>
              <RadioGroup value={formType} onValueChange={(value) => setFormType(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">
                    Blank Form
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uad_3_6" id="uad_3_6" />
                  <Label htmlFor="uad_3_6" className="cursor-pointer">
                    UAD 3.6 (Uniform Appraisal Dataset)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uad_2_6" id="uad_2_6" />
                  <Label htmlFor="uad_2_6" className="cursor-pointer">
                    UAD 2.6 (Legacy)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bpo" id="bpo" />
                  <Label htmlFor="bpo" className="cursor-pointer">
                    BPO (Broker Price Opinion)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Form</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
