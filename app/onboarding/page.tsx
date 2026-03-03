"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Rocket, Building2, LayoutGrid, ArrowRight, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const slug = orgName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
    
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify({ orgName, slug }),
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) router.push("/")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-6 bg-[url('/grid.svg')] bg-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-card rounded-3xl border border-neon-purple/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Rocket className="w-24 h-24 text-neon-purple rotate-12" />
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-neon-purple" />
          </div>
          <h1 className="text-2xl font-black text-star-white font-display uppercase italic tracking-tight">Setup Your Factory</h1>
          <p className="text-sm text-star-faint mt-2">Welcome to DayOne. To begin, create your organization.</p>
        </div>

        <form onSubmit={handleOnboard} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-star-faint uppercase font-bold tracking-widest ml-1">Company Name</label>
            <input 
              required
              type="text" 
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Morse Advanced Manufacturing"
              className="w-full bg-space-800 border border-space-600 rounded-xl py-3 px-4 text-sm text-star-bright outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !orgName}
            className="w-full py-4 bg-neon-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow-purple transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Create Organization <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-space-700/50 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Ready</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
