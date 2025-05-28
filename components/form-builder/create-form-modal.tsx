"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, Home, Settings } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, "Form name is required").max(100, "Form name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  formType: z.enum(["uad_3_6", "uad_2_6", "bpo", "other"]),
})

type FormData = z.infer<typeof formSchema>

interface CreateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateForm: (formConfig: FormData) => void
}

const formTypes = [
  {
    id: "uad_3_6",
    label: "UAD 3.6",
    description: "Uniform Appraisal Dataset 3.6 - Latest standard",
    icon: FileText,
    isDefault: true,
  },
  {
    id: "uad_2_6",
    label: "UAD 2.6",
    description: "Uniform Appraisal Dataset 2.6 - Legacy standard",
    icon: FileText,
    isDefault: false,
  },
  {
    id: "bpo",
    label: "BPO",
    description: "Broker Price Opinion form",
    icon: Home,
    isDefault: false,
  },
  {
    id: "other",
    label: "Other",
    description: "Custom form type",
    icon: Settings,
    isDefault: false,
  },
]

export function CreateFormModal({ open, onOpenChange, onCreateForm }: CreateFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      formType: "uad_3_6",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      onCreateForm(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>Set up your new form with a name, description, and type to get started.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter form name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter an optional description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Briefly describe the purpose of this form</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Form Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      {formTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <div key={type.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={type.id} id={type.id} />
                            <Label
                              htmlFor={type.id}
                              className="flex items-center space-x-3 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{type.label}</span>
                                  {type.isDefault && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
