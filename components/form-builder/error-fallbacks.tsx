"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorFallbackProps {
  onRetry?: () => void
  onReset?: () => void
  context?: string
  error?: Error
}

export function FormBuilderErrorFallback({ onRetry, onReset, context = "Form Builder" }: ErrorFallbackProps) {
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {context} Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The form builder encountered an unexpected error. Your work may have been saved automatically.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Form Builder
              </Button>
            )}
            {onReset && (
              <Button onClick={onReset} variant="outline" className="w-full">
                Reset to Last Saved
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = "/dashboard/form-builder")}
              variant="outline"
              className="w-full"
            >
              Back to Forms List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FieldEditorErrorFallback({ onRetry, context = "Field Editor" }: ErrorFallbackProps) {
  return (
    <div className="w-[550px] bg-white border-l shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-destructive">Field Editor Error</h3>
          <p className="text-sm text-muted-foreground">Unable to load field properties</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h4 className="font-medium">Field Editor Crashed</h4>
              <p className="text-sm text-muted-foreground mt-1">
                There was an error loading the field properties panel.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function FormCanvasErrorFallback({ onRetry, context = "Form Canvas" }: ErrorFallbackProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Form Canvas Error</h3>
              <p className="text-muted-foreground">
                Unable to render the form canvas. This might be due to corrupted form data.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {onRetry && (
                <Button onClick={onRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Form
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FormPreviewErrorFallback({ onRetry, context = "Form Preview" }: ErrorFallbackProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Preview Error</h3>
              <p className="text-muted-foreground">
                Unable to generate form preview. The form structure may be invalid.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {onRetry && (
                <Button onClick={onRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Preview
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.reload()}>
                Exit Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FieldPaletteErrorFallback({ onRetry, context = "Field Palette" }: ErrorFallbackProps) {
  return (
    <div className="w-80 bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-destructive">Palette Error</h2>
      </div>
      <div className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Unable to load field palette. Some features may be unavailable.</AlertDescription>
        </Alert>
        {onRetry && (
          <Button onClick={onRetry} className="w-full mt-4" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

export function PageNavigationErrorFallback({ onRetry, context = "Page Navigation" }: ErrorFallbackProps) {
  return (
    <div className="border-b bg-gray-50 p-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Page navigation error. Unable to load pages.</span>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
