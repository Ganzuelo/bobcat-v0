"use client"

import { useState, useCallback } from "react"

interface FormStructure {
  name: string
  pages: FormPage[]
}

interface FormPage {
  id: string
  page_order: number
  title: string
  elements: FormElement[]
}

interface FormElement {
  id: string
  type: string
  label: string
  // Add more element properties as needed
}

const useFormBuilder = () => {
  const [formStructure, setFormStructure] = useState<FormStructure>({
    name: "Untitled Form",
    pages: [],
  })

  const handleUpdateFormName = useCallback((newName: string) => {
    setFormStructure((prev) => ({
      ...prev,
      name: newName,
    }))
  }, [])

  const handleAddPage = useCallback(() => {
    const newPage: FormPage = {
      id: crypto.randomUUID(),
      page_order: formStructure.pages.length + 1,
      title: "New Page",
      elements: [],
    }

    setFormStructure((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }))
  }, [formStructure.pages])

  const handleUpdatePage = useCallback((pageId: string, updatedPage: Partial<FormPage>) => {
    setFormStructure((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => (page.id === pageId ? { ...page, ...updatedPage } : page)),
    }))
  }, [])

  const handleDeletePage = useCallback((pageId: string) => {
    setFormStructure((prev) => ({
      ...prev,
      pages: prev.pages
        .filter((page) => page.id !== pageId)
        .map((page, index) => ({
          ...page,
          page_order: index + 1,
        })),
    }))
  }, [])

  const handleAddElement = useCallback((pageId: string) => {
    const newElement: FormElement = {
      id: crypto.randomUUID(),
      type: "text",
      label: "New Question",
    }

    setFormStructure((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === pageId ? { ...page, elements: [...page.elements, newElement] } : page,
      ),
    }))
  }, [])

  const handleUpdateElement = useCallback((pageId: string, elementId: string, updatedElement: Partial<FormElement>) => {
    setFormStructure((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              elements: page.elements.map((element) =>
                element.id === elementId ? { ...element, ...updatedElement } : element,
              ),
            }
          : page,
      ),
    }))
  }, [])

  const handleDeleteElement = useCallback((pageId: string, elementId: string) => {
    setFormStructure((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              elements: page.elements.filter((element) => element.id !== elementId),
            }
          : page,
      ),
    }))
  }, [])

  const handleReorderPages = useCallback((reorderedPages: FormPage[]) => {
    setFormStructure((prev) => ({
      ...prev,
      pages: reorderedPages.map((page, index) => ({
        ...page,
        page_order: index + 1,
      })),
    }))
  }, [])

  return {
    formStructure,
    handleUpdateFormName,
    handleAddPage,
    handleUpdatePage,
    handleDeletePage,
    handleAddElement,
    handleUpdateElement,
    handleDeleteElement,
    handleReorderPages,
  }
}

export default useFormBuilder
