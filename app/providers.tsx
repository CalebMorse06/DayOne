"use client"

import type { ReactNode } from "react"
import { DemoGuideProvider } from "@/components/shared/DemoGuideProvider"
import { DemoGuide } from "@/components/shared/DemoGuide"

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <DemoGuideProvider>
      {children}
      <DemoGuide />
    </DemoGuideProvider>
  )
}
