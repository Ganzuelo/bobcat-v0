"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Rule } from "@/lib/types"

interface RuleContextType {
  currentRule: Rule | null
  setCurrentRule: (rule: Rule | null) => void
}

const RuleContext = createContext<RuleContextType | undefined>(undefined)

export function RuleProvider({ children }: { children: ReactNode }) {
  const [currentRule, setCurrentRule] = useState<Rule | null>(null)

  return <RuleContext.Provider value={{ currentRule, setCurrentRule }}>{children}</RuleContext.Provider>
}

export function useRuleContext() {
  const context = useContext(RuleContext)
  if (context === undefined) {
    throw new Error("useRuleContext must be used within a RuleProvider")
  }
  return context
}
