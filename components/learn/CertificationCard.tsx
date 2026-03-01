"use client"

import { Award, ShieldCheck, Share2, Download, CheckCircle2, Globe } from "lucide-react"
import { motion } from "framer-motion"
import type { Certification } from "@/lib/certification-schema"
import { cn } from "@/lib/utils"

interface CertificationCardProps {
  cert: Certification
  onClose?: () => void
}

export function CertificationCard({ cert, onClose }: CertificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border border-warm-amber/30 bg-space-900 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-warm-amber/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="relative p-8 md:p-12">
        {/* Certificate Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-warm-amber/20 scale-150"
            />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-warm-amber to-warm-copper flex items-center justify-center shadow-glow-warm">
              <Award className="w-10 h-10 text-space-900" />
            </div>
          </div>
          
          <h2 className="text-sm font-bold text-warm-amber uppercase tracking-[0.2em] mb-2">Certificate of Competence</h2>
          <h1 className="text-3xl md:text-4xl font-black text-star-white font-display uppercase italic tracking-tighter">Verified Specialist</h1>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-star-faint text-sm mb-1 uppercase tracking-wider">This certifies that</p>
            <p className="text-2xl font-bold text-star-bright underline decoration-warm-amber/40 underline-offset-8 decoration-2">{cert.userName}</p>
          </div>

          <div className="text-center">
            <p className="text-star-faint text-sm mb-1 uppercase tracking-wider">Has mastered the curriculum for</p>
            <p className="text-xl font-bold text-cyan-400">{cert.courseTitle}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-space-700/50">
            <div className="text-center">
              <p className="text-[10px] text-star-faint uppercase mb-1">Mastery</p>
              <p className="text-xl font-mono font-bold text-star-white">{cert.masteryScore}%</p>
            </div>
            <div className="text-center border-x border-space-700/50">
              <p className="text-[10px] text-star-faint uppercase mb-1">Accuracy</p>
              <p className="text-xl font-mono font-bold text-star-white">{cert.quizAccuracy}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-star-faint uppercase mb-1">Safety</p>
              <p className="text-sm font-bold text-warm-amber">{cert.safetyCompliance}</p>
            </div>
          </div>

          {/* Skills List */}
          <div>
            <p className="text-[10px] text-star-faint uppercase mb-3 text-center tracking-widest">Verified Tactical Skills</p>
            <div className="flex flex-wrap justify-center gap-2">
              {cert.verifiedSkills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-space-800 border border-space-700 text-[10px] text-star-dim">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-space-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-space-800 rounded-lg">
              <Globe className="w-8 h-8 text-star-faint" />
            </div>
            <div>
              <p className="text-[10px] text-star-faint uppercase font-bold">Verification Hash</p>
              <p className="text-[10px] font-mono text-star-dim break-all max-w-[150px]">{cert.certificationHash}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-800 border border-space-700 text-xs font-bold text-star-bright hover:bg-space-700 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warm-amber text-space-900 text-xs font-bold hover:shadow-glow-warm transition-all">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
