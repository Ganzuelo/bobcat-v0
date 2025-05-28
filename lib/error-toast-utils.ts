"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clipboard, Check } from "lucide-react"

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const result = document.execCommand("copy")
    document.body.removeChild(textArea)
    return result
  } catch (err) {
    console.error("Failed to copy text: ", err)
    return false
  }
}

export function showErrorToast(toast: any, title: string, description: string) {
  toast({
    title: `❌ ${title}`,
    description: (
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1">{description}</span>
        <CopyButton text={description} />
      </div>
    ),
    variant: "destructive",
  })
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 w-6 p-0 hover:bg-red-100 shrink-0"
      title={copied ? "Copied!" : "Copy error message"}
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Clipboard className="h-3 w-3" />}
    </Button>
  )
}
