import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * STRIPE CUSTOMER PORTAL STRATEGY:
 * Instead of building a credit card management UI, we redirect the user 
 * to a Stripe-hosted page where they can update their plan, cancel, or 
 * view invoices. This is the fastest way to get to production.
 */

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json()
    
    // 1. Get current user and Org data
    const { data: { session } } = await supabase!.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: org } = await supabase!
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', orgId)
      .single()

    if (!org?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    // 2. Create Stripe Portal Session
    // In production:
    // const portalSession = await stripe.billingPortal.sessions.create({
    //   customer: org.stripe_customer_id,
    //   return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/org`,
    // });
    
    console.log(`Mocking Stripe Portal for Customer: ${org.stripe_customer_id}`)
    
    return NextResponse.json({ 
      url: "https://billing.stripe.com/p/session/mock_portal_" + Math.random().toString(36).substring(7),
      mock: true 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
