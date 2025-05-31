"use client"

import { DynamicBreadcrumbs } from "@/components/breadcrumbs"
import { PageActionButton } from "@/components/page-action-button"
import { OnboardingTip } from "@/components/onboarding-tip"

interface PageHeaderProps {
  onboardingTip?: {
    message: string
    storageKey: string
  }
}

export function PageHeader({ onboardingTip }: PageHeaderProps) {
  const breadcrumbs = <DynamicBreadcrumbs />
  const hasBreadcrumbs = breadcrumbs !== null

  return (
    <div className={hasBreadcrumbs ? "space-y-4" : ""}>
      {hasBreadcrumbs && (
        <div className="flex items-center justify-between">
          {breadcrumbs}
          <PageActionButton />
        </div>
      )}
      {onboardingTip && (
        <div className="w-full">
          <OnboardingTip message={onboardingTip.message} storageKey={onboardingTip.storageKey} />
        </div>
      )}
    </div>
  )
}
