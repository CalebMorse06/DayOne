"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Languages, Globe, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Mandarin", native: "普通话", flag: "🇨🇳" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
]

interface TranslationToolProps {
  module: any
  onTranslated: (newModule: any) => void
}

export function TranslationTool({ module, onTranslated }: TranslationToolProps) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleTranslate = async () => {
    if (!selectedLang) return
    setIsTranslating(true)
    
    try {
      const targetLang = LANGUAGES.find(l => l.code === selectedLang)?.name || "Spanish"
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ module, targetLanguage: targetLang }),
        headers: { "Content-Type": "application/json" }
      })
      const { translatedModule } = await res.json()
      onTranslated(translatedModule)
      setShowConfirm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="mt-6 p-6 glass-card rounded-2xl border border-cyan-400/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <Languages className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-star-bright">Global Deployment</h3>
            <p className="text-xs text-star-faint">Translate this course for your global workforce</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-400/30 px-2 py-0.5 rounded-full">Pro</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setSelectedLang(lang.code)
              setShowConfirm(true)
            }}
            disabled={isTranslating}
            className={cn(
              "p-3 rounded-xl border transition-all text-center group",
              selectedLang === lang.code 
                ? "bg-cyan-400/10 border-cyan-400 text-star-bright" 
                : "bg-space-800 border-space-700 text-star-dim hover:border-cyan-400/50 hover:text-star-bright"
            )}
          >
            <div className="text-xl mb-1 group-hover:scale-125 transition-transform">{lang.flag}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider">{lang.name}</div>
            <div className="text-[8px] text-star-faint">{lang.native}</div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-space-900 border border-space-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-warm-amber" />
                <p className="text-xs text-star-dim">
                  Translate to <span className="font-bold text-star-bright">{LANGUAGES.find(l => l.code === selectedLang)?.name}</span>? 
                  This will generate a new localized version of this course.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-star-faint hover:text-star-bright transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="px-6 py-2 bg-cyan-400 text-space-900 rounded-lg text-xs font-bold shadow-glow-cyan flex items-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      Confirm Translation <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
