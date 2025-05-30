"use client"

import { useState, useCallback } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SortableField } from "./sortable-field"
import { FieldPropertiesModal } from "./field-properties-modal"

const fieldTypes = [
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Text Area",
    value: "textarea",
  },
  {
    label: "Select",
    value: "select",
  },
  {
    label: "Switch",
    value: "switch",
  },
] as const

type FieldType = (typeof fieldTypes)[number]["value"]

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Form title must be at least 2 characters.",
  }),
})

type FormField = {
  id: string
  label: string
  type: FieldType
  required: boolean
  options?: { label: string; value: string }[]
}

interface SimpleFormBuilderProps {
  onSubmit?: (values: any) => void
}

export function SimpleFormBuilder({ onSubmit }: SimpleFormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>([])

  const [fieldPropertiesModal, setFieldPropertiesModal] = useState<{
    isOpen: boolean
    field: FormField | null
  }>({
    isOpen: false,
    field: null,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        id: Math.random().toString(36).substring(7),
        label: "Untitled",
        type: "text",
        required: false,
      },
    ])
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) => {
        if (field.id === id) {
          return { ...field, ...updates }
        }
        return field
      }),
    )
  }

  const handleEditField = (field: FormField) => {
    setFieldPropertiesModal({
      isOpen: true,
      field,
    })
  }

  const handleCloseFieldProperties = () => {
    setFieldPropertiesModal({
      isOpen: false,
      field: null,
    })
  }

  const handleSaveFieldProperties = (fieldId: string, updates: Partial<FormField>) => {
    updateField(fieldId, updates)
    setFieldPropertiesModal({
      isOpen: false,
      field: null,
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event

      if (!over) {
        return
      }

      if (active.id !== over.id) {
        setFields((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)

          return arrayMove(items, oldIndex, newIndex)
        })
      }
    },
    [fields, setFields],
  )

  const onSubmitForm = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (onSubmit) {
      onSubmit(values)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Form Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      type={field.type}
                      required={field.required}
                      onDelete={() => handleDeleteField(field.id)}
                      onEdit={handleEditField} // Replace onSelect
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Field
            </Button>
            <Separator />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
      <FieldPropertiesModal
        field={fieldPropertiesModal.field}
        isOpen={fieldPropertiesModal.isOpen}
        onClose={handleCloseFieldProperties}
        onSave={handleSaveFieldProperties}
        otherFields={fields.filter((f) => f.id !== fieldPropertiesModal.field?.id)}
      />
    </Card>
  )
}
