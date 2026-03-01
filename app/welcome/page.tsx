"use client"

import { useRouter } from "next/navigation"
import { HeroLanding } from "@/components/shared/HeroLanding"
import { seedDemoData } from "@/lib/seed-demo"
import { DEMO_MODE_CHANGED } from "@/components/shared/DemoGuideProvider"

export default function WelcomePage() {
  const router = useRouter()

  const handleTryDemo = () => {
    seedDemoData()
    window.dispatchEvent(new Event(DEMO_MODE_CHANGED))
    router.push("/courses/mod_demo_001")
  }

  const handleUploadVideo = () => {
    router.push("/courses/builder")
  }

  return <HeroLanding onTryDemo={handleTryDemo} onUploadVideo={handleUploadVideo} />
}
