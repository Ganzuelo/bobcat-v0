"use client"

import { useState, useCallback } from "react"
import type { FormData, FormField, FormPage, FormSection } from "@/lib/types"
import { safeArray, safeObject, safeNumber, safeString, safeId, devWarn } from "@/lib/null-safety"

export function useFormBuilder(initialFormData?: FormData | null) {
  // Safely initialize form data
  const safeInitialData = safeObject(initialFormData) as FormData
  const initialPages = safeArray<FormPage>(safeInitialData.pages, [])

  const [formData, setFormData] = useState<FormData>({
    id: safeString(safeInitialData.id, `form_${Date.now()}`),
    title: safeString(safeInitialData.title, "Untitled Form"),
    description: safeString(safeInitialData.description, ""),
    pages:
      initialPages.length > 0
        ? initialPages
        : [
            {
              id: `page_${Date.now()}`,
              title: "Page 1",
              description: "",
              sections: [],
            },
          ],
  })

  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Development warnings
  devWarn(!!formData, "useFormBuilder: formData is null")
  devWarn(formData.pages.length > 0, "useFormBuilder: No pages in form data")

  // Safe page navigation
  const handlePageChange = useCallback(
    (pageIndex: number) => {
      const safePageIndex = safeNumber(pageIndex, 0)
      const maxIndex = Math.max(0, formData.pages.length - 1)
      const clampedIndex = Math.min(Math.max(0, safePageIndex), maxIndex)

      devWarn(
        safePageIndex >= 0 && safePageIndex < formData.pages.length,
        `useFormBuilder.handlePageChange: Invalid page index ${safePageIndex}`,
      )

      setCurrentPageIndex(clampedIndex)
    },
    [formData.pages.length],
  )

  // Safe page reordering
  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const safeFromIndex = safeNumber(fromIndex, 0)
      const safeToIndex = safeNumber(toIndex, 0)
      const pagesLength = formData.pages.length

      // Validate indices
      if (
        safeFromIndex < 0 ||
        safeFromIndex >= pagesLength ||
        safeToIndex < 0 ||
        safeToIndex >= pagesLength ||
        safeFromIndex === safeToIndex
      ) {
        devWarn(false, `useFormBuilder.handleReorderPages: Invalid indices from=${safeFromIndex}, to=${safeToIndex}`)
        return
      }

      setFormData((prevData) => {
        const newPages = [...safeArray(prevData.pages, [])]
        const [movedPage] = newPages.splice(safeFromIndex, 1)

        if (!movedPage) {
          devWarn(false, "useFormBuilder.handleReorderPages: Failed to extract page for reordering")
          return prevData
        }

        newPages.splice(safeToIndex, 0, movedPage)

        return {
          ...prevData,
          pages: newPages,
        }
      })

      // Update current page index if necessary
      if (currentPageIndex === safeFromIndex) {
        setCurrentPageIndex(safeToIndex)
      } else if (currentPageIndex > safeFromIndex && currentPageIndex <= safeToIndex) {
        setCurrentPageIndex(currentPageIndex - 1)
      } else if (currentPageIndex < safeFromIndex && currentPageIndex >= safeToIndex) {
        setCurrentPageIndex(currentPageIndex + 1)
      }
    },
    [formData.pages.length, currentPageIndex],
  )

  // Safe section operations
  const handleSectionAdd = useCallback(
    (pageIndex: number) => {
      const safePageIndex = safeNumber(pageIndex, 0)

      if (safePageIndex < 0 || safePageIndex >= formData.pages.length) {
        devWarn(false, `useFormBuilder.handleSectionAdd: Invalid page index ${safePageIndex}`)
        return
      }

      setFormData((prevData) => {
        const newPages = [...safeArray(prevData.pages, [])]
        const targetPage = safeObject(newPages[safePageIndex]) as FormPage

        if (!targetPage) {
          devWarn(false, `useFormBuilder.handleSectionAdd: Page at index ${safePageIndex} is null`)
          return prevData
        }

        const newSection: FormSection = {
          id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `Section ${safeArray(targetPage.sections, []).length + 1}`,
          description: "",
          fields: [],
        }

        newPages[safePageIndex] = {
          ...targetPage,
          sections: [...safeArray(targetPage.sections, []), newSection],
        }

        return {
          ...prevData,
          pages: newPages,
        }
      })
    },
    [formData.pages.length],
  )

  const handleSectionDelete = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const safePageIndex = safeNumber(pageIndex, 0)
      const safeSectionIndex = safeNumber(sectionIndex, 0)

      if (safePageIndex < 0 || safePageIndex >= formData.pages.length) {
        devWarn(false, `useFormBuilder.handleSectionDelete: Invalid page index ${safePageIndex}`)
        return
      }

      setFormData((prevData) => {
        const newPages = [...safeArray(prevData.pages, [])]
        const targetPage = safeObject(newPages[safePageIndex]) as FormPage

        if (!targetPage) {
          devWarn(false, `useFormBuilder.handleSectionDelete: Page at index ${safePageIndex} is null`)
          return prevData
        }

        const sections = safeArray(targetPage.sections, [])

        if (safeSectionIndex < 0 || safeSectionIndex >= sections.length) {
          devWarn(false, `useFormBuilder.handleSectionDelete: Invalid section index ${safeSectionIndex}`)
          return prevData
        }

        const newSections = sections.filter((_, index) => index !== safeSectionIndex)

        newPages[safePageIndex] = {
          ...targetPage,
          sections: newSections,
        }

        return {
          ...prevData,
          pages: newPages,
        }
      })
    },
    [formData.pages.length],
  )

  // Safe field operations
  const handleFieldAdd = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const safePageIndex = safeNumber(pageIndex, 0)
      const safeSectionIndex = safeNumber(sectionIndex, 0)

      if (safePageIndex < 0 || safePageIndex >= formData.pages.length) {
        devWarn(false, `useFormBuilder.handleFieldAdd: Invalid page index ${safePageIndex}`)
        return
      }

      setFormData((prevData) => {
        const newPages = [...safeArray(prevData.pages, [])]
        const targetPage = safeObject(newPages[safePageIndex]) as FormPage

        if (!targetPage) {
          devWarn(false, `useFormBuilder.handleFieldAdd: Page at index ${safePageIndex} is null`)
          return prevData
        }

        const sections = safeArray(targetPage.sections, [])

        if (safeSectionIndex < 0 || safeSectionIndex >= sections.length) {
          devWarn(false, `useFormBuilder.handleFieldAdd: Invalid section index ${safeSectionIndex}`)
          return prevData
        }

        const targetSection = safeObject(sections[safeSectionIndex]) as FormSection

        if (!targetSection) {
          devWarn(false, `useFormBuilder.handleFieldAdd: Section at index ${safeSectionIndex} is null`)
          return prevData
        }

        const newField: FormField = {
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          field_type: "text",
          label: `Field ${safeArray(targetSection.fields, []).length + 1}`,
          placeholder: "",
          help_text: "",
          required: false,
          readonly: false,
          default_value: "",
          uad_field_id: "",
        }

        const newSections = [...sections]
        newSections[safeSectionIndex] = {
          ...targetSection,
          fields: [...safeArray(targetSection.fields, []), newField],
        }

        newPages[safePageIndex] = {
          ...targetPage,
          sections: newSections,
        }

        return {
          ...prevData,
          pages: newPages,
        }
      })
    },
    [formData.pages.length],
  )

  const handleFieldEdit = useCallback((field: FormField) => {
    const safeField = safeObject(field) as FormField
    const fieldId = safeId(safeField.id, "unknown")

    devWarn(!!safeField.id, "useFormBuilder.handleFieldEdit: Field missing ID")

    // TODO: Implement field editing modal/panel
    console.log("Edit field:", fieldId, safeField)
  }, [])

  const handleFieldDelete = useCallback((fieldId: string) => {
    const safeFieldId = safeString(fieldId, "")

    if (!safeFieldId) {
      devWarn(false, "useFormBuilder.handleFieldDelete: Invalid field ID")
      return
    }

    setFormData((prevData) => {
      const newPages = safeArray(prevData.pages, []).map((page) => {
        const pageObj = safeObject(page) as FormPage
        const sections = safeArray(pageObj.sections, []).map((section) => {
          const sectionObj = safeObject(section) as FormSection
          const fields = safeArray(sectionObj.fields, []).filter((field) => {
            const fieldObj = safeObject(field) as FormField
            return safeString(fieldObj.id, "") !== safeFieldId
          })

          return {
            ...sectionObj,
            fields,
          }
        })

        return {
          ...pageObj,
          sections,
        }
      })

      return {
        ...prevData,
        pages: newPages,
      }
    })
  }, [])

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
