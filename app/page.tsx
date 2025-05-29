"use client"

import { FormCanvas } from "@/components/form-builder/form-canvas"
import { PageNavigation } from "@/components/form-builder/page-navigation"
import { useFormBuilder } from "@/hooks/use-form-builder"
import { DevModeIndicator } from "@/components/dev-mode-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Save, Download } from "lucide-react"

export default function HomePage() {
  const {
    formData,
    currentPageIndex,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    hasError,
    error,
    loadForm,
    saveForm,
    handlePageChange,
    handleReorderPages,
    handleSectionAdd,
    handleSectionDelete,
    handleFieldAdd,
    handleFieldEdit,
    handleFieldDelete,
    clearError,
  } = useFormBuilder()

  const handleSave = async () => {
    const success = await saveForm()
    if (success) {
      console.log("Form saved successfully")
    }
  }

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(formData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.title.replace(/\s+/g, "_")}_form.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Bobcat</h1>
                <p className="text-sm text-gray-600">Advanced Form Builder</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Save Status */}
                <div className="text-sm text-gray-500">
                  {isSaving && "Saving..."}
                  {hasUnsavedChanges && !isSaving && "Unsaved changes"}
                  {lastSaved && !hasUnsavedChanges && `Saved ${lastSaved.toLocaleTimeString()}`}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>

                  <Button onClick={handleExportJSON} variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                </div>

                {/* Form Info */}
                <div className="text-sm text-gray-500 border-l pl-4">
                  <div>{formData.pages?.length || 0} pages</div>
                  <div className="font-medium">{formData.title}</div>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {hasError && error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium">Error: {error.message}</p>
                    <p className="text-red-600 text-sm">Code: {error.code}</p>
                  </div>
                  <Button onClick={clearError} variant="outline" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </header>

          {/* Page Navigation */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <PageNavigation
              pages={formData.pages}
              currentPageIndex={currentPageIndex}
              onPageChange={handlePageChange}
              onReorderPages={handleReorderPages}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading form builder...</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <DevModeIndicator />
      </div>
    </ErrorBoundary>
  )
}
