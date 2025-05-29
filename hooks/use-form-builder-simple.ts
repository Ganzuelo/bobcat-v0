"use client"

import { useState, useCallback } from "react"
import type { FormData, FormField, FormSection } from "@/lib/types"

export function useFormBuilder(initialFormData?: FormData | null) {
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialFormData && initialFormData.pages && initialFormData.pages.length > 0) {
      return initialFormData
    }

    return {
      id: `form_${Date.now()}`,
      title: "Untitled Form",
      description: "",
      pages: [
        {
          id: `page_${Date.now()}`,
          title: "Page 1",
          description: "",
          sections: [],
        },
      ],
    }
  })

  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const handlePageChange = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < formData.pages.length) {
        setCurrentPageIndex(pageIndex)
      }
    },
    [formData.pages.length],
  )

  const handleSectionAdd = useCallback((pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= formData.pages.length) return

    setFormData((prevData) => {
      const newPages = [...prevData.pages]
      const targetPage = newPages[pageIndex]

      if (!targetPage) return prevData

      const newSection: FormSection = {
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Section ${(targetPage.sections || []).length + 1}`,
        description: "",
        fields: [],
      }

      newPages[pageIndex] = {
        ...targetPage,
        sections: [...(targetPage.sections || []), newSection],
      }

      return {
        ...prevData,
        pages: newPages,
      }
    })
  }, [])

  const handleSectionDelete = useCallback((pageIndex: number, sectionIndex: number) => {
    if (pageIndex < 0 || pageIndex >= formData.pages.length) return

    setFormData((prevData) => {
      const newPages = [...prevData.pages]
      const targetPage = newPages[pageIndex]

      if (!targetPage || !targetPage.sections) return prevData

      const newSections = targetPage.sections.filter((_, index) => index !== sectionIndex)

      newPages[pageIndex] = {
        ...targetPage,
        sections: newSections,
      }

      return {
        ...prevData,
        pages: newPages,
      }
    })
  }, [])

  const handleFieldAdd = useCallback((pageIndex: number, sectionIndex: number) => {
    if (pageIndex < 0 || pageIndex >= formData.pages.length) return

    setFormData((prevData) => {
      const newPages = [...prevData.pages]
      const targetPage = newPages[pageIndex]

      if (!targetPage || !targetPage.sections || sectionIndex >= targetPage.sections.length) return prevData

      const newSections = [...targetPage.sections]
      const targetSection = newSections[sectionIndex]

      const newField: FormField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        field_type: "text",
        label: `Field ${(targetSection.fields || []).length + 1}`,
        placeholder: "",
        help_text: "",
        required: false,
        readonly: false,
        default_value: "",
        uad_field_id: "",
      }

      newSections[sectionIndex] = {
        ...targetSection,
        fields: [...(targetSection.fields || []), newField],
      }

      newPages[pageIndex] = {
        ...targetPage,
        sections: newSections,
      }

      return {
        ...prevData,
        pages: newPages,
      }
    })
  }, [])

  const handleFieldEdit = useCallback((field: FormField) => {
    console.log("Edit field:", field)
    // TODO: Implement field editing
  }, [])

  const handleFieldDelete = useCallback((fieldId: string) => {
    if (!fieldId) return

    setFormData((prevData) => {
      const newPages = prevData.pages.map((page) => ({
        ...page,
        sections: (page.sections || []).map((section) => ({
          ...section,
          fields: (section.fields || []).filter((field) => field.id !== fieldId),
        })),
      }))

      return {
        ...prevData,
        pages: newPages,
      }
    })
  }, [])

  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= formData.pages.length ||
        toIndex >= formData.pages.length
      ) {
        return
      }

      setFormData((prevData) => {
        const newPages = [...prevData.pages]
        const [movedPage] = newPages.splice(fromIndex, 1)
        newPages.splice(toIndex, 0, movedPage)

        return {
          ...prevData,
          pages: newPages,
        }
      })

      // Update current page index if necessary
      if (currentPageIndex === fromIndex) {
        setCurrentPageIndex(toIndex)
      } else if (currentPageIndex > fromIndex && currentPageIndex <= toIndex) {
        setCurrentPageIndex(currentPageIndex - 1)
      } else if (currentPageIndex < fromIndex && currentPageIndex >= toIndex) {
        setCurrentPageIndex(currentPageIndex + 1)
      }
    },
    [formData.pages.length, currentPageIndex],
  )

  return {
    formData,
    currentPageIndex,
    setFormData,
    handlePageChange,
    handleReorderPages,
    handleSectionAdd,
    handleSectionDelete,
    handleFieldAdd,
    handleFieldEdit,
    handleFieldDelete,
  }
}
