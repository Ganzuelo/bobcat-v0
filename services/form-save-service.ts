import { supabase } from "@/lib/supabase-client"
import { DatabaseService } from "@/lib/database-service"

export interface SaveResult {
  success: boolean
  data?: any
  errors?: string[]
}

// Reuse the existing validation types from database-service
export interface FormSaveData {
  form: any
  pages: any[]
  sections: any[]
  fields: any[]
}

// Use static class pattern to match existing code
export class FormSaveService {
  // Save form with transaction-like behavior
  static async saveForm(formData: any): Promise<SaveResult> {
    console.log("🔧 FormSaveService.saveForm called with:", formData)

    try {
      // Use the existing DatabaseService for saving
      const savedStructure = await DatabaseService.saveFormStructure(formData)

      console.log("✅ Form saved successfully:", savedStructure.form.id)
      return {
        success: true,
        data: savedStructure,
      }
    } catch (error) {
      console.error("❌ Form save failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      }
    }
  }

  // Reorder fields within a section
  static async reorderFields(sectionId: string, fieldIds: string[]): Promise<SaveResult> {
    try {
      console.log(`🔄 Reordering fields in section ${sectionId}`)

      // Update each field with its new order
      const updates = fieldIds.map((fieldId, index) => {
        return DatabaseService.updateField(fieldId, {
          field_order: index,
        })
      })

      await Promise.all(updates)

      console.log(`✅ Fields reordered successfully in section ${sectionId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Field reordering failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to reorder fields"],
      }
    }
  }

  // Move field up in order
  static async moveFieldUp(sectionId: string, fieldId: string): Promise<SaveResult> {
    try {
      console.log(`🔼 Moving field ${fieldId} up in section ${sectionId}`)

      // Get all fields in the section
      const { data: fields, error } = await supabase
        .from("form_fields")
        .select("id, field_order")
        .eq("section_id", sectionId)
        .order("field_order")

      if (error) throw error

      // Find the current field and the one above it
      const currentIndex = fields.findIndex((f) => f.id === fieldId)
      if (currentIndex <= 0) {
        return {
          success: false,
          errors: ["Field is already at the top"],
        }
      }

      // Swap the field orders
      const currentField = fields[currentIndex]
      const aboveField = fields[currentIndex - 1]

      await Promise.all([
        DatabaseService.updateField(currentField.id, { field_order: aboveField.field_order }),
        DatabaseService.updateField(aboveField.id, { field_order: currentField.field_order }),
      ])

      console.log(`✅ Field ${fieldId} moved up successfully`)
      return { success: true }
    } catch (error) {
      console.error("❌ Move field up failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to move field up"],
      }
    }
  }

  // Move field down in order
  static async moveFieldDown(sectionId: string, fieldId: string): Promise<SaveResult> {
    try {
      console.log(`🔽 Moving field ${fieldId} down in section ${sectionId}`)

      // Get all fields in the section
      const { data: fields, error } = await supabase
        .from("form_fields")
        .select("id, field_order")
        .eq("section_id", sectionId)
        .order("field_order")

      if (error) throw error

      // Find the current field and the one below it
      const currentIndex = fields.findIndex((f) => f.id === fieldId)
      if (currentIndex === -1 || currentIndex >= fields.length - 1) {
        return {
          success: false,
          errors: ["Field is already at the bottom"],
        }
      }

      // Swap the field orders
      const currentField = fields[currentIndex]
      const belowField = fields[currentIndex + 1]

      await Promise.all([
        DatabaseService.updateField(currentField.id, { field_order: belowField.field_order }),
        DatabaseService.updateField(belowField.id, { field_order: currentField.field_order }),
      ])

      console.log(`✅ Field ${fieldId} moved down successfully`)
      return { success: true }
    } catch (error) {
      console.error("❌ Move field down failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to move field down"],
      }
    }
  }

  // Update form status (draft/published)
  static async updateFormStatus(formId: string, status: "draft" | "published"): Promise<SaveResult> {
    try {
      console.log(`📝 Updating form ${formId} status to ${status}`)

      const updates: any = { status }

      // Add published_at timestamp if publishing
      if (status === "published") {
        updates.published_at = new Date().toISOString()
      }

      await DatabaseService.updateForm(formId, updates)

      console.log(`✅ Form status updated to ${status}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Update form status failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to update form status"],
      }
    }
  }
}
