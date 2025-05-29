"use client"

import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

// Define types
interface FormStructure {
  pages: Page[]
}

interface Page {
  id: string
  title: string
  elements: FormElement[]
}

interface FormElement {
  id: string
  type: string
  label: string
  // Add more element properties as needed
}

// Placeholder components (replace with actual implementations)
const PageNavigation = ({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onReorderPages,
}: {
  pages: Page[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
  onReorderPages: (newOrder: Page[]) => void
}) => {
  return (
    <div>
      <button onClick={onAddPage}>Add Page</button>
      {pages.map((page, index) => (
        <button key={page.id} onClick={() => onPageChange(index)}>
          {page.title}
        </button>
      ))}
      <button onClick={() => onReorderPages([...pages].reverse())}>Reverse Pages</button>
    </div>
  )
}

const PageContent = ({ page }: { page: Page }) => {
  return (
    <div>
      <h2>{page.title}</h2>
      {page.elements.map((element) => (
        <div key={element.id}>
          <label>{element.label}</label>
          {/* Render element based on type */}
        </div>
      ))}
    </div>
  )
}

// Custom hook for form builder logic
const useFormBuilder = (initialFormStructure: FormStructure) => {
  const [formStructure, setFormStructure] = useState<FormStructure>(initialFormStructure)

  const handleAddPage = useCallback(() => {
    const newPage: Page = {
      id: Math.random().toString(36).substring(7),
      title: `Page ${formStructure.pages.length + 1}`,
      elements: [],
    };
    setFormStructure({ ...formStructure, pages: [...formStructure.pages, newPage] });\
  }, [formStructure);

  const handleReorderPages = useCallback(
    (newOrder: Page[]) => {
      setFormStructure({ ...formStructure, pages: newOrder })
    },
    [formStructure],
  )

  return {
    formStructure,
    handleAddPage,
    handleReorderPages,
  }
}

// Main FormBuilder component
const FormBuilderV2 = ({ initialFormStructure }: { initialFormStructure: FormStructure }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [formStructure, setFormStructure] = useState(initialFormStructure)

  const { handleAddPage, handleReorderPages } = useFormBuilder(initialFormStructure)

  const handleReorderPagesInner = (reorderedPages: Page[]) => {
    if (!formStructure) return

    const updatedFormStructure = {
      ...formStructure,
      pages: reorderedPages,
    }

    setFormStructure(updatedFormStructure)

    // toast({
    //   title: "✅ Pages Reordered",
    //   description: "Page order has been updated",
    // })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <PageNavigation
        pages={formStructure.pages}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onAddPage={() => handleAddPage({ title: `Page ${formStructure.pages.length + 1}` })}
        onReorderPages={handleReorderPagesInner}
      />
      <PageContent page={formStructure.pages[currentPageIndex]} />
    </DndProvider>
  )
}

export default FormBuilderV2
