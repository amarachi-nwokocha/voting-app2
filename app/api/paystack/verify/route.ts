import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

console.log("[v0] Initializing Supabase client...")

let supabase: SupabaseClient | null = null
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log("[v0] ✅ Supabase client initialized")
    } else {
      console.error("[v0] ❌ Missing Supabase credentials")
    }
  } catch (error) {
    console.warn("[v0] ⚠️ Supabase client initialization failed:", error)
  }
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
console.log("[v0] PAYSTACK_SECRET_KEY:", PAYSTACK_SECRET_KEY ? "found" : "MISSING")

interface Vote {
  contestantId: string
  contestantName: string
  votes: number
}

export async function POST(request: NextRequest) {
  console.log("[v0] === Payment verification API called ===")

  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Server configuration error", details: "Database service not available" },
        { status: 500 },
      )
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Server configuration error", details: "Payment service not configured" },
        { status: 500 },
      )
    }

    // ✅ Get reference from request body
    const body = await request.json().catch(() => null)
    const reference = body?.reference
console.log(reference);

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing payment reference", details: "Reference parameter is required" },
        { status: 400 },
      )
    }

    console.log("[v0] 🔎 Verifying payment with Paystack, reference:", reference)

    // ✅ Call Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed", details: data.message || "Unknown failure" },
        { status: response.status },
      )
    }

    if (data.data.status === "success") {
      console.log("[v0] 🎉 Payment successful")

      const { metadata, customer } = data.data
      const votes: Vote[] = metadata?.votes || []
      const voterEmail = customer?.email

      if (!votes.length) {
        return NextResponse.json(
          { success: false, error: "Invalid payment data", details: "No votes found in payment metadata" },
          { status: 400 },
        )
      }

      // ✅ Prevent duplicate vote insertion
      const { data: existingData } = await supabase
        .from("votes")
        .select("id")
        .eq("payment_reference", reference)
        .limit(1)

      if (existingData && existingData.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Votes already recorded for this payment",
          data: data.data,
        })
      }

      const voteInserts = []
      for (const vote of votes) {
        for (let i = 0; i < vote.votes; i++) {
          voteInserts.push({
            contestant_id: vote.contestantId,
            payment_reference: reference,
            amount_paid: 100,
            voter_email: voterEmail,
            created_at: new Date().toISOString(),
          })
        }
      }
console.log(voteInserts);

      const { error: insertError } = await supabase.from("votes").insert(voteInserts)
      if (insertError) {
        return NextResponse.json(
          { success: false, error: "Failed to record votes", details: insertError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and votes recorded successfully",
        data: {
          ...data.data,
          votesRecorded: voteInserts.length,
          contestants: votes.map((v: Vote) => ({
            name: v.contestantName,
            votes: v.votes,
          })),
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "Payment not successful", details: `Payment status: ${data.data.status}` },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] ❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: "Unexpected error occurred" },
      { status: 500 },
    )
  }
}
