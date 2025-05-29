"use client"

import type React from "react"
import { useState } from "react"
import type { Page } from "../../types/form"
import PageNavigation from "./page-navigation"

interface FormBuilderProps {
  initialForm?: { pages: Page[] }
}

const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm }) => {
  const [form, setForm] = useState<{ pages: Page[] }>({ pages: initialForm?.pages || [{ id: "1", elements: [] }] })
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const handleAddPage = () => {
    const newPageId = String(Math.random()) // Generate a unique ID
    setForm((prev) => ({
      ...prev,
      pages: [...prev.pages, { id: newPageId, elements: [] }],
    }))
  }

  const handleReorderPages = (reorderedPages: typeof form.pages) => {
    setForm((prev) => ({
      ...prev,
      pages: reorderedPages,
    }))
  }

  return (
    <div>
      <PageNavigation
        pages={form.pages}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onAddPage={handleAddPage}
        onReorderPages={handleReorderPages} // Make sure this is passed
      />
      <div>
        {/* Page Content will go here */}
        {form.pages[currentPageIndex] ? (
          <div>
            <h3>Page {currentPageIndex + 1}</h3>
            {/* Render elements of the page here */}
          </div>
        ) : (
          <div>No pages yet. Add a page to start building your form.</div>
        )}
      </div>
    </div>
  )
}

export default FormBuilder
