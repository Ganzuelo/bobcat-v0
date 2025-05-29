"use client"

import type React from "react"
import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { FormPage, FormSection, FormField, FormStructure } from "../../types/formTypes"
import PageNavigation from "./page-navigation"
import Page from "./page"

interface FormBuilderProps {
  initialFormStructure?: FormStructure
}

const FormBuilder: React.FC<FormBuilderProps> = ({ initialFormStructure }) => {
  const [formStructure, setFormStructure] = useState<FormStructure>(
    initialFormStructure || { pages: [{ id: "page-1", title: "Page 1", sections: [] }] },
  )
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const handleAddField = (sectionIndex: number) => {
    if (!formStructure) return

    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
    }

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, pageIndex) =>
        pageIndex === currentPageIndex
          ? {
              ...page,
              sections: page.sections.map((section, i) =>
                i === sectionIndex ? { ...section, fields: [...section.fields, newField] } : section,
              ),
            }
          : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleAddSection = () => {
    if (!formStructure) return

    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      fields: [],
    }

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, pageIndex) =>
        pageIndex === currentPageIndex ? { ...page, sections: [...page.sections, newSection] } : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleAddPage = () => {
    if (!formStructure) return

    const newPage: FormPage = {
      id: `page-${Date.now()}`,
      title: "New Page",
      sections: [],
    }

    const updatedFormStructure = {
      ...formStructure,
      pages: [...formStructure.pages, newPage],
    }

    setFormStructure(updatedFormStructure)
  }

  const handleEditPage = (pageIndex: number, newTitle: string) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) => (i === pageIndex ? { ...page, title: newTitle } : page)),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleReorderPages = (
    reorderedPages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[],
  ) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: reorderedPages,
    }

    setFormStructure(updatedFormStructure)
  }

  const handleUpdateField = (pageIndex: number, sectionIndex: number, fieldIndex: number, updatedField: FormField) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) =>
        i === pageIndex
          ? {
              ...page,
              sections: page.sections.map((section, j) =>
                j === sectionIndex
                  ? {
                      ...section,
                      fields: section.fields.map((field, k) => (k === fieldIndex ? updatedField : field)),
                    }
                  : section,
              ),
            }
          : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleDeleteField = (pageIndex: number, sectionIndex: number, fieldIndex: number) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) =>
        i === pageIndex
          ? {
              ...page,
              sections: page.sections.map((section, j) =>
                j === sectionIndex
                  ? {
                      ...section,
                      fields: section.fields.filter((_, k) => k !== fieldIndex),
                    }
                  : section,
              ),
            }
          : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleDeleteSection = (pageIndex: number, sectionIndex: number) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) =>
        i === pageIndex
          ? {
              ...page,
              sections: page.sections.filter((_, j) => j !== sectionIndex),
            }
          : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleReorderSections = (pageIndex: number, reorderedSections: FormSection[]) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) => (i === pageIndex ? { ...page, sections: reorderedSections } : page)),
    }

    setFormStructure(updatedFormStructure)
  }

  const handleReorderFields = (pageIndex: number, sectionIndex: number, reorderedFields: FormField[]) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: formStructure.pages.map((page, i) =>
        i === pageIndex
          ? {
              ...page,
              sections: page.sections.map((section, j) =>
                j === sectionIndex ? { ...section, fields: reorderedFields } : section,
              ),
            }
          : page,
      ),
    }

    setFormStructure(updatedFormStructure)
  }

  const currentPage = formStructure?.pages[currentPageIndex]

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <PageNavigation
          pages={formStructure.pages}
          currentPageIndex={currentPageIndex}
          onPageChange={setCurrentPageIndex}
          onAddPage={handleAddPage}
          onReorderPages={handleReorderPages}
          onEditPage={handleEditPage}
        />

        {currentPage && (
          <Page
            page={currentPage}
            pageIndex={currentPageIndex}
            onAddField={handleAddField}
            onAddSection={handleAddSection}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
            onDeleteSection={handleDeleteSection}
            onReorderSections={handleReorderSections}
            onReorderFields={handleReorderFields}
          />
        )}
      </div>
    </DndProvider>
  )
}

export default FormBuilder
