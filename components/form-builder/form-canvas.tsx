import type { FormPage } from "./types"
import { PageNavigation } from "./page-navigation"

interface FormCanvasProps {
  pages: FormPage[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
  onReorderPages?: (pages: FormPage[]) => void
}

export function FormCanvas({ pages, currentPageIndex, onPageChange, onAddPage, onReorderPages }: FormCanvasProps) {
  return (
    <div>
      {/* Render the current page */}
      {pages[currentPageIndex] && (
        <div>
          <h2>Page {currentPageIndex + 1}</h2>
          {/* Render form elements for the current page */}
          {/* Example: {pages[currentPageIndex].elements.map(element => ...)} */}
        </div>
      )}

      {/* Page Navigation */}
      <PageNavigation
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageChange={onPageChange}
        onAddPage={onAddPage}
        onReorderPages={onReorderPages}
      />
    </div>
  )
}
