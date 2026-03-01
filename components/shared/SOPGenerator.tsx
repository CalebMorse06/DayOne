"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Download, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import type { SOP } from "@/lib/sop-schema"
import type { LearningModule } from "@/lib/types"

interface SOPGeneratorProps {
  module: LearningModule
}

export function SOPGenerator({ module }: SOPGeneratorProps) {
  const [sop, setSop] = useState<SOP | null>(null)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module }),
      })
      const data = await response.json()
      setSop(data)
      setExpanded(true)
    } catch (error) {
      console.error("Failed to generate SOP:", error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mt-6 border border-space-600 rounded-2xl bg-space-800/50 overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warm-amber/20 rounded-lg">
            <FileText className="w-5 h-5 text-warm-amber" />
          </div>
          <div>
            <h3 className="text-star-bright font-medium">Standard Operating Procedure</h3>
            <p className="text-xs text-star-faint">AI-generated documentation from video analysis</p>
          </div>
        </div>

        {!sop ? (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-warm-amber text-space-900 rounded-lg text-sm font-medium hover:shadow-glow-warm transition-all disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate SOP"
            )}
          </button>
        ) : (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-star-faint hover:text-star-bright transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && sop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-space-600 bg-space-900/50"
          >
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-star-bright">{sop.title}</h2>
                  <p className="text-xs text-star-faint mt-1">Version {sop.version} • {new Date(sop.lastUpdated).toLocaleDateString()}</p>
                </div>
                <button className="flex items-center gap-2 text-xs text-warm-amber hover:underline">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              <section>
                <h4 className="text-xs font-bold text-star-faint uppercase tracking-wider mb-2">Objective</h4>
                <p className="text-sm text-star-bright leading-relaxed">{sop.objective}</p>
              </section>

              <div className="grid grid-cols-2 gap-6">
                <section>
                  <h4 className="text-xs font-bold text-star-faint uppercase tracking-wider mb-2">PPE Required</h4>
                  <ul className="space-y-1">
                    {sop.ppeRequired.map((item, i) => (
                      <li key={i} className="text-sm text-star-bright flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-warm-amber" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-star-faint uppercase tracking-wider mb-2">Tools Required</h4>
                  <ul className="space-y-1">
                    {sop.toolsRequired.map((item, i) => (
                      <li key={i} className="text-sm text-star-bright flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section>
                <h4 className="text-xs font-bold text-star-faint uppercase tracking-wider mb-3">Procedure Steps</h4>
                <div className="space-y-4">
                  {sop.procedureSteps.map((step) => (
                    <div key={step.stepNumber} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-space-700 flex items-center justify-center text-xs font-bold text-star-bright border border-space-600">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-star-bright">{step.title}</p>
                        <p className="text-sm text-star-faint leading-relaxed">{step.action}</p>
                        {step.proTip && (
                          <div className="mt-2 p-2 rounded bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400">
                            <strong>Pro Tip:</strong> {step.proTip}
                          </div>
                        )}
                        {step.hazardNote && (
                          <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
                            <strong>Safety:</strong> {step.hazardNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-star-faint uppercase tracking-wider mb-2">Troubleshooting</h4>
                <div className="space-y-2">
                  {sop.troubleshooting.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-space-700/50 border border-space-600 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-star-faint uppercase">Symptom</p>
                        <p className="text-sm text-star-bright">{item.symptom}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-star-faint uppercase">Remedy</p>
                        <p className="text-sm text-star-bright">{item.remedy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
