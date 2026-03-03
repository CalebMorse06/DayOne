import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { orgName, slug } = await request.json()
    
    // 1. Get current user
    const { data: { session } } = await supabase!.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Create Organization
    const { data: org, error: orgError } = await supabase!
      .from('organizations')
      .insert({ name: orgName, slug, plan: 'free' })
      .select()
      .single()

    if (orgError) throw orgError

    // 3. Create Membership (as Owner)
    const { error: memError } = await supabase!
      .from('memberships')
      .insert({ org_id: org.id, user_id: session.user.id, role: 'owner' })

    if (memError) throw memError

    return NextResponse.json({ org })
  } catch (error: any) {
    console.error("Onboarding failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
