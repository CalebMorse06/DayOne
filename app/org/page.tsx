"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Building2, CreditCard, Users, Settings, Plus, LayoutGrid } from "lucide-react"
import { Sidebar } from "@/components/shared/Sidebar"

export default function OrgSettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])

  // Load organization and members from Supabase
  useEffect(() => {
    async function loadOrg() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Mock loading for demo purposes
        setOrg({
          name: "Caleb's Factory",
          plan: "Pro",
          slug: "calebs-factory"
        })
        setMembers([
          { email: "caleb@example.com", role: "Owner" },
          { email: "worker1@example.com", role: "Member" },
          { email: "supervisor@example.com", role: "Admin" }
        ])
      }
    }
    loadOrg()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:pl-0">
        <div className="max-w-4xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-star-white font-display uppercase tracking-tight italic">
              Organization Management
            </h1>
            <p className="text-sm text-star-faint">Manage your company settings, billing, and team access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 glass-card rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-star-bright">Company Settings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-star-faint uppercase font-bold">Company Name</label>
                  <input 
                    type="text" 
                    value={org?.name || ""} 
                    className="w-full mt-1 bg-space-800 border border-space-600 rounded-xl py-2 px-4 text-sm text-star-bright outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-[10px] text-star-faint uppercase font-bold">Public Slug</label>
                  <p className="text-sm text-star-dim font-mono mt-1">dayone.vercel.app/org/{org?.slug}</p>
                </div>
              </div>
            </div>

            <div className="p-6 glass-warm rounded-2xl border border-warm-amber/20">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-warm-amber" />
                <h3 className="font-bold text-star-bright">Subscription Plan</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl font-black text-warm-amber">{org?.plan || "Free"}</p>
                <span className="text-xs text-star-faint">Tier</span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={async () => {
                    const res = await fetch("/api/billing/checkout", {
                      method: "POST",
                      body: JSON.stringify({ orgId: "demo-org-id", priceId: "price_pro_monthly" }),
                      headers: { "Content-Type": "application/json" }
                    })
                    const { url } = await res.json()
                    if (url) window.location.href = url
                  }}
                  className="w-full py-3 bg-warm-amber text-space-900 rounded-xl text-sm font-bold shadow-glow-warm active:scale-[0.98] transition-all"
                >
                  {org?.plan === "Pro" ? "Manage Subscription" : "Upgrade Plan"}
                </button>
                {org?.plan === "Pro" && (
                  <button 
                    onClick={async () => {
                      const res = await fetch("/api/billing/portal", {
                        method: "POST",
                        body: JSON.stringify({ orgId: "demo-org-id" }),
                        headers: { "Content-Type": "application/json" }
                      })
                      const { url } = await res.json()
                      if (url) window.location.href = url
                    }}
                    className="w-full py-2 bg-space-800 border border-space-700 text-star-bright rounded-xl text-xs font-bold hover:bg-space-700 transition-all"
                  >
                    View Billing Portal
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-space-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-star-bright">Team Members</h3>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline">
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-space-900/50 text-[10px] text-star-faint uppercase tracking-widest">
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-space-700/30">
                  {members.map((member, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-sm text-star-bright">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-star-dim">{member.role}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 text-[10px] font-bold">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
