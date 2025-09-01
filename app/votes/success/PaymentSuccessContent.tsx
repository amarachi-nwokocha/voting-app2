import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

console.log("[v0] Initializing Supabase client...")

let supabase: SupabaseClient | null = null
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Supabase URL:", supabaseUrl ? "found" : "MISSING")
    console.log("[v0] Supabase Service Role Key:", supabaseKey ? "found" : "MISSING")

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
      console.error("[v0] ❌ Supabase client not available")
      return NextResponse.json(
        { success: false, error: "Server configuration error", details: "Database service not available" },
        { status: 500 },
      )
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error("[v0] ❌ PAYSTACK_SECRET_KEY is missing")
      return NextResponse.json(
        { success: false, error: "Server configuration error", details: "Payment service not configured" },
        { status: 500 },
      )
    }

    console.log("[v0] Parsing request body...")
    let requestBody
    try {
      requestBody = await request.json()
      console.log("[v0] ✅ Request body parsed:", requestBody)
    } catch (parseError) {
      console.error("[v0] ❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid request format", details: "Request body must be valid JSON" },
        { status: 400 },
      )
    }

    const { reference } = requestBody
    console.log(reference);
    
    if (!reference) {
      console.error("[v0] ❌ Missing payment reference in request body")
      return NextResponse.json(
        { success: false, error: "Missing payment reference", details: "Reference parameter is required" },
        { status: 400 },
      )
    }

    console.log("[v0] 🔎 Verifying payment with Paystack, reference:", reference)

    let response
    try {
      response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })
      console.log("[v0] ✅ Paystack request sent. Status:", response.status)
    } catch (fetchError) {
      console.error("[v0] ❌ Failed to connect to Paystack:", fetchError)
      return NextResponse.json(
        { success: false, error: "Payment service unavailable", details: "Could not connect to payment provider" },
        { status: 503 },
      )
    }

    let data
    try {
      data = await response.json()
      console.log("[v0] ✅ Paystack response parsed:", JSON.stringify(data, null, 2).substring(0, 500))
    } catch (jsonError) {
      console.error("[v0] ❌ Failed to parse Paystack response:", jsonError)
      return NextResponse.json(
        { success: false, error: "Invalid response from payment service", details: "Could not parse response" },
        { status: 502 },
      )
    }

    if (!response.ok || !data.status) {
      console.error("[v0] ❌ Payment verification failed:", data)
      return NextResponse.json(
        { success: false, error: "Payment verification failed", details: data.message || "Unknown failure" },
        { status: 400 },
      )
    }

    console.log("[v0] ✅ Payment verification passed, Paystack status:", data.data?.status)

    if (data.data.status === "success") {
      console.log("[v0] 🎉 Payment success — preparing to record votes")

      const { metadata, customer } = data.data
      const votes: Vote[] = metadata?.votes || []
      const voterEmail = customer?.email

      console.log("[v0] Votes metadata:", votes)
      console.log("[v0] Voter email:", voterEmail)

      if (!votes.length) {
        console.error("[v0] ❌ No votes found in Paystack metadata")
        return NextResponse.json(
          { success: false, error: "Invalid payment data", details: "No votes found in payment metadata" },
          { status: 400 },
        )
      }

      console.log("[v0] Checking if votes already recorded for reference:", reference)
      const { data: existingData, error: selectError } = await supabase
        .from("votes")
        .select("id")
        .eq("payment_reference", reference)
        .limit(1)

      if (selectError) {
        console.error("[v0] ❌ Database select error:", selectError)
        return NextResponse.json(
          { success: false, error: "Database error", details: "Could not check existing votes" },
          { status: 500 },
        )
      }

      if (existingData && existingData.length > 0) {
        console.log("[v0] ⚠️ Votes already recorded for this reference")
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

      console.log("[v0] Inserting", voteInserts.length, "votes into Supabase")

      const { error: insertError } = await supabase.from("votes").insert(voteInserts)
      if (insertError) {
        console.error("[v0] ❌ Failed to insert votes:", insertError)
        return NextResponse.json(
          { success: false, error: "Failed to record votes", details: insertError.message },
          { status: 500 },
        )
      }

      console.log("[v0] ✅ Votes recorded successfully")

      return NextResponse.json({
        success: true,
        message: "Payment verified and votes recorded successfully",
        data: {
          ...data.data,
          votesRecorded: voteInserts.length,
          contestants: votes.map((v: Vote) => ({ name: v.contestantName, votes: v.votes })),
        },
      })
    }

    console.log("[v0] ⚠️ Payment not successful. Status:", data.data.status)
    return NextResponse.json(
      { success: false, error: "Payment not successful", details: `Payment status: ${data.data.status}` },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in payment verification:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: "Unexpected error occurred" },
      { status: 500 },
    )
  }
}
