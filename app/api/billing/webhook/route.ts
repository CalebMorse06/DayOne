import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const payload = await req.text()
  // const sig = req.headers.get('stripe-signature')!

  let event;

  try {
    // In production: event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    event = JSON.parse(payload); // Mocking for demo
    
    console.log('Stripe Webhook Received:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const orgId = session.metadata.orgId;
        const customerId = session.customer;

        // Update Organization to Pro Plan
        await supabase!
          .from('organizations')
          .update({ 
            plan: 'pro', 
            stripe_customer_id: customerId 
          })
          .eq('id', orgId);
        
        console.log(`Org ${orgId} upgraded to PRO via Stripe.`);
        break;
      
      case 'customer.subscription.deleted':
        // Handle cancellation
        const subscription = event.data.object;
        await supabase!
          .from('organizations')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', subscription.customer);
        break;
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
