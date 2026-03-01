"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Rocket, Award } from "lucide-react"
import { ProgressRing } from "@/components/shared/ProgressRing"
import { Confetti } from "@/components/shared/Confetti"
import { CompletionIllustration } from "@/components/shared/illustrations"
import { CertificationCard } from "./CertificationCard"

interface CompletionBadgeProps {
  moduleTitle: string
  xpEarned: number
  cardsCompleted: number
  quizScore: number
  onContinue: () => void
}

export function CompletionBadge({
  moduleTitle,
  xpEarned,
  cardsCompleted,
  quizScore,
  onContinue,
}: CompletionBadgeProps) {
  const [showCert, setShowCert] = useState(false)

  if (showCert) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <CertificationCard 
          cert={{
            id: `cert_${Date.now()}`,
            userName: "Caleb Morse",
            courseId: "mod_demo",
            courseTitle: moduleTitle,
            issuedAt: new Date().toISOString(),
            masteryScore: 100,
            quizAccuracy: quizScore,
            verifiedSkills: ["Precision Measurement", "Safety Protocol", "Equipment Maintenance"],
            safetyCompliance: quizScore > 90 ? "Exemplary" : "Standard",
            certificationHash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          }}
        />
        <button
          onClick={onContinue}
          className="mt-8 px-8 py-3 bg-space-800 border border-space-700 text-star-bright rounded-2xl font-bold hover:bg-space-700 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      <Confetti active />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="flex flex-col items-center text-center p-6"
      >
        {/* Trophy illustration */}
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-4"
        >
          <CompletionIllustration size={96} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-1"
        >
          <Rocket className="w-5 h-5 text-warm-amber" />
          <h2 className="text-xl font-bold text-star-white font-display">
            Mission Complete!
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-star-dim mb-6"
        >
          {moduleTitle}
        </motion.p>

        {/* Stats with ProgressRings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 w-full mb-8"
        >
          <div className="flex flex-col items-center p-3 glass-card rounded-xl">
            <ProgressRing value={100} size={48} strokeWidth={3} color="amber" />
            <p className="text-lg font-bold font-mono text-star-white mt-1">{xpEarned}</p>
            <p className="text-[10px] text-star-faint">XP Earned</p>
          </div>
          <div className="flex flex-col items-center p-3 glass-card rounded-xl">
            <ProgressRing value={100} size={48} strokeWidth={3} color="cyan" />
            <p className="text-lg font-bold font-mono text-star-white mt-1">{cardsCompleted}</p>
            <p className="text-[10px] text-star-faint">Cards Done</p>
          </div>
          <div className="flex flex-col items-center p-3 glass-card rounded-xl">
            <ProgressRing value={quizScore} size={48} strokeWidth={3} color={quizScore >= 70 ? "green" : quizScore >= 40 ? "amber" : "magenta"} />
            <p className="text-lg font-bold font-mono text-star-white mt-1">{quizScore}%</p>
            <p className="text-[10px] text-star-faint">Quiz Score</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => setShowCert(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-warm-amber to-warm-copper text-space-900 font-bold rounded-xl shadow-glow-warm transition-all active:scale-[0.98]"
          >
            <Award className="w-5 h-5" />
            Claim Certification
          </button>
          
          <button
            onClick={onContinue}
            className="w-full p-4 bg-space-800 border border-space-700 text-star-bright font-semibold rounded-xl transition-colors hover:bg-space-700 active:scale-[0.98]"
          >
            Continue to Ask the Expert
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}
