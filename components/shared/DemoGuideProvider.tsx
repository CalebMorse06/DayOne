"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface DemoGuideContextValue {
  isDemoMode: boolean
  isVisible: boolean
  setIsVisible: (v: boolean) => void
  refreshDemoMode: () => void
}

const DemoGuideContext = createContext<DemoGuideContextValue>({
  isDemoMode: false,
  isVisible: false,
  setIsVisible: () => {},
  refreshDemoMode: () => {},
})

export function useDemoGuide() {
  return useContext(DemoGuideContext)
}

/** Custom event name used to signal demo mode state changes within the same tab */
export const DEMO_MODE_CHANGED = "dayone-demo-mode-changed"

export function DemoGuideProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const refreshDemoMode = useCallback(() => {
    try {
      const raw = localStorage.getItem("dayone-state")
      if (raw) {
        const state = JSON.parse(raw)
        setIsDemoMode(!!state.demoMode)
      }
    } catch {}
  }, [])

  useEffect(() => {
    refreshDemoMode()

    const onDemoChange = () => refreshDemoMode()
    window.addEventListener(DEMO_MODE_CHANGED, onDemoChange)
    return () => window.removeEventListener(DEMO_MODE_CHANGED, onDemoChange)
  }, [refreshDemoMode])

  return (
    <DemoGuideContext.Provider value={{ isDemoMode, isVisible, setIsVisible, refreshDemoMode }}>
      {children}
    </DemoGuideContext.Provider>
  )
}
