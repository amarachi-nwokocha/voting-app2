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
  amount?: number 
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
    console.log("[v0] Payment reference:", reference);

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

      const { metadata, customer, amount } = data.data
      const votes: Vote[] = metadata?.votes || []
      const voterEmail = customer?.email
      const contestantIds = metadata?.contestant_ids || ""
      
      console.log("[v0] 👥 Contestant IDs in payment:", contestantIds)
      console.log("[v0] 📊 Vote details:", votes.map(v => `${v.contestantName} (${v.contestantId}): ₦${v.votes * 100}`))

      if (!votes.length) {
        return NextResponse.json(
          { success: false, error: "Invalid payment data", details: "No votes found in payment metadata" },
          { status: 400 },
        )
      }

      // ✅ VALIDATION 1: Check voting period
      const validateVotingPeriod = () => {
        const now = new Date()
        const votingStart = new Date('2025-09-08T00:00:00Z') // September 8, 2025
        const votingEnd = new Date('2025-10-19T23:59:59Z')   // October 19, 2025 (41 days later)
        
        console.log("[v0] 📅 Checking voting period...")
        console.log(`[v0] Current time: ${now.toISOString()}`)
        console.log(`[v0] Voting period: ${votingStart.toISOString()} to ${votingEnd.toISOString()}`)
        
        if (now < votingStart) {
          throw new Error(`Voting has not started yet. Voting begins on ${votingStart.toLocaleDateString()}`)
        }
        
        if (now > votingEnd) {
          throw new Error(`Voting has ended. Voting closed on ${votingEnd.toLocaleDateString()}`)
        }
        
        console.log("[v0] ✅ Voting period is valid")
      }

      // ✅ VALIDATION 2: Validate contestant IDs exist in database
      const validateContestantIds = async (votes: Vote[]) => {
        console.log("[v0] 👤 Validating contestant IDs...")
        
        const contestantIds = votes.map(v => v.contestantId)
        console.log("[v0] IDs to validate:", contestantIds)
        
        // Fetch ALL contestant data we'll need
        const { data: validContestants, error } = await supabase
          .from("contestants")
          .select("id, name, registration_code")
          .in("id", contestantIds)
        
        if (error) {
          console.error("[v0] ❌ Error checking contestants:", error)
          throw new Error("Failed to validate contestants")
        }
        
        console.log("[v0] 📋 Contestant data from database:", JSON.stringify(validContestants, null, 2))
        
        const validIds = validContestants?.map(c => c.id) || []
        const invalidIds = contestantIds.filter(id => !validIds.includes(id))
        
        console.log("[v0] Valid contestant IDs:", validIds)
        
        if (invalidIds.length > 0) {
          console.error("[v0] ❌ Invalid contestant IDs found:", invalidIds)
          throw new Error(`Invalid contestant IDs: ${invalidIds.join(', ')}. These contestants do not exist.`)
        }
        
        console.log("[v0] ✅ All contestant IDs are valid")
        return validContestants
      }

      // ✅ VALIDATION 3: Validate payment amount matches expected
      const validatePaymentAmount = (votes: Vote[], actualAmount: number) => {
        console.log("[v0] 💰 Validating payment amount...")
        
        const expectedAmount = votes.reduce((sum, vote) => sum + (vote.votes * 100), 0)
        const expectedAmountKobo = expectedAmount * 100 // Convert to kobo
        
        console.log(`[v0] Expected amount: ₦${expectedAmount} (${expectedAmountKobo} kobo)`)
        console.log(`[v0] Actual amount: ₦${actualAmount / 100} (${actualAmount} kobo)`)
        
        if (actualAmount !== expectedAmountKobo) {
          throw new Error(`Payment amount mismatch. Expected: ₦${expectedAmount}, but received: ₦${actualAmount / 100}`)
        }
        
        console.log("[v0] ✅ Payment amount is correct")
      }

      try {
        // Run all validations before processing
        console.log("[v0] 🔍 Running validations...")
        
        validateVotingPeriod()
        const validContestants = await validateContestantIds(votes)
        validatePaymentAmount(votes, amount)
        
        console.log("[v0] ✅ All validations passed!")

        // ✅ Prevent duplicate vote insertion
        const { data: existingData } = await supabase
          .from("votes")
          .select("id")
          .eq("payment_reference", reference)
          .limit(1)

        if (existingData && existingData.length > 0) {
          console.log("[v0] ⚠️ Votes already recorded for reference:", reference)
          return NextResponse.json({
            success: true,
            message: "Votes already recorded for this payment",
            data: {
              ...data.data,
              validationStatus: "passed",
              votingPeriodActive: true
            },
          })
        }

        // ✅ Create ONE transaction per contestant with validation data
        const voteInserts = []
        for (const vote of votes) {
          const totalAmount = vote.votes * 100 // This is the TOTAL amount for this contestant
          console.log(`[v0] 📝 Recording ₦${totalAmount} transaction for contestant ${vote.contestantId} (${vote.contestantName})`)
          
          // Get contestant details from our validation result
          const contestantDetails = validContestants?.find(c => c.id === vote.contestantId)
          
          voteInserts.push({
            contestant_id: vote.contestantId,
            contestant_name: vote.contestantName,
            contestant_code: contestantDetails?.registration_code || null,
            payment_reference: reference,
            vote_count: vote.votes, // This is the NUMBER of votes (e.g., 5)
            amount_paid: totalAmount, // This is the TOTAL amount (e.g., ₦500)
            voter_email: voterEmail,
            transaction_type: 'bulk_vote',
            validation_status: 'verified',
            created_at: new Date().toISOString(),
          })
        }

        console.log(`[v0] 💾 Inserting ${voteInserts.length} validated transaction records`)
        console.log("[v0] 📋 Vote inserts data:", voteInserts)

        const { error: insertError } = await supabase.from("votes").insert(voteInserts)
        if (insertError) {
          console.error("[v0] ❌ Database insert error:", insertError)
          return NextResponse.json(
            { success: false, error: "Failed to record votes", details: insertError.message },
            { status: 500 },
          )
        }

        console.log("[v0] ✅ All transactions recorded successfully with validation")

        return NextResponse.json({
          success: true,
          message: "Payment verified and votes recorded successfully",
          data: {
            ...data.data,
            transactionsRecorded: voteInserts.length,
            validationStatus: "passed",
            votingPeriodActive: true,
            contestants: votes.map((v: Vote) => ({
              id: v.contestantId,
              name: v.contestantName,
              votes: v.votes,
              amount: v.votes * 100,
              validated: true,
            })),
            contestantIds: contestantIds,
          },
        })

      } catch (validationError) {
        console.error("[v0] ❌ Validation failed:", validationError)
        
        // Get error message safely
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Unknown validation error"
        
        // Return specific error message to user
        return NextResponse.json(
          { 
            success: false, 
            error: "Validation failed", 
            details: errorMessage,
            validationStatus: "failed"
          },
          { status: 400 },
        )
      }
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