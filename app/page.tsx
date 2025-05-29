"use client"

import { FormCanvas } from "@/components/form-builder/form-canvas-simple"
import { PageNavigation } from "@/components/form-builder/page-navigation-simple"
import { useFormBuilder } from "@/hooks/use-form-builder-simple"
import { DevModeIndicator } from "@/components/dev-mode-indicator"

export default function HomePage() {
  const {
    formData,
    currentPageIndex,
    handlePageChange,
    handleReorderPages,
    handleSectionAdd,
    handleSectionDelete,
    handleFieldAdd,
    handleFieldEdit,
    handleFieldDelete,
  } = useFormBuilder()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Bobcat</h1>
              <p className="text-sm text-gray-600">Form Builder</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {formData.pages?.length || 0} pages • {formData.title}
              </span>
            </div>
          </div>
        </header>

        {/* Page Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <PageNavigation
            pages={formData.pages || []}
            currentPageIndex={currentPageIndex}
            onPageChange={handlePageChange}
            onReorderPages={handleReorderPages}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <FormCanvas
            formData={formData}
            currentPageIndex={currentPageIndex}
            onFieldEdit={handleFieldEdit}
            onFieldDelete={handleFieldDelete}
            onSectionAdd={handleSectionAdd}
            onSectionDelete={handleSectionDelete}
            onFieldAdd={handleFieldAdd}
            onPageChange={handlePageChange}
            onReorderPages={handleReorderPages}
          />
        </div>
      </div>

      <DevModeIndicator />
    </div>
  )
}
