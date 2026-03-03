import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * PRODUCTION PAYWALL & RATE LIMIT STRATEGY:
 * 
 * 1. Usage Tracking: 
 *    - Store 'usage_count' in the organizations/profiles table.
 *    - Track 'video_minutes_processed' and 'ai_questions_asked'.
 * 
 * 2. The Limits (Free Tier):
 *    - Courses: 2 Max
 *    - Video: 30 Minutes Total
 *    - AI Questions: 5 per Course
 * 
 * 3. Enforcement:
 *    - Before calling Gemini, check if the organization has an active 'pro' subscription.
 *    - If not, verify they are within the Free Tier thresholds.
 */

export async function checkUsageLimit(orgId: string, type: 'course' | 'video' | 'question', amount: number = 1) {
  if (!supabase) return { allowed: true } // Development safety

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, usage_stats')
    .eq('id', orgId)
    .single()

  if (org?.plan === 'pro' || org?.plan === 'enterprise') {
    return { allowed: true }
  }

  const stats = org?.usage_stats || { courses: 0, video_minutes: 0, questions: 0 }

  if (type === 'course' && stats.courses >= 2) {
    return { allowed: false, reason: 'Course limit reached (2/2). Upgrade to Pro for unlimited courses.' }
  }

  if (type === 'video' && (stats.video_minutes + amount) > 30) {
    return { allowed: false, reason: 'Video processing limit reached (30 min). Upgrade to Pro to analyze more footage.' }
  }

  if (type === 'question' && stats.questions >= 5) {
    return { allowed: false, reason: 'AI Mentor limit reached (5 questions). Upgrade to Pro for unlimited expert access.' }
  }

  return { allowed: true }
}

export async function incrementUsage(orgId: string, type: 'course' | 'video' | 'question', amount: number = 1) {
  // Logic to increment the specific stat in Supabase JSONB or dedicated columns
  console.log(`Incrementing ${type} usage for org ${orgId} by ${amount}`)
}
