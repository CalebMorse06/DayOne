import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * ORG INVITATION STRATEGY:
 * 1. Admin enters an email.
 * 2. API generates a unique token.
 * 3. In production: API sends an email via Resend/SendGrid.
 * 4. For demo: We provide the "Magic Link" to copy.
 */

export async function POST(request: NextRequest) {
  try {
    const { email, orgId, role } = await request.json()
    
    // 1. Authorization check
    const { data: { session } } = await supabase!.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 2. Generate a mock invitation token
    const token = Math.random().toString(36).substring(2, 15)
    
    // 3. In production: await supabase.from('invitations').insert({ email, org_id: orgId, role, token })
    
    console.log(`Inviting ${email} to Org ${orgId} as ${role}`)
    
    return NextResponse.json({ 
      success: true,
      inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/join?token=${token}`,
      mock: true
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
