import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../lib/supabaseServer"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

interface Vote {
  contestantId: string
  contestantName: string
  votes: number
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Payment verification started")

    if (!PAYSTACK_SECRET_KEY) {
      console.error("[v0] PAYSTACK_SECRET_KEY is not set")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Payment service not configured",
        },
        { status: 500 },
      )
    }

    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: "Request body must be valid JSON",
        },
        { status: 400 },
      )
    }

    const { reference } = requestBody

    if (!reference) {
      console.error("[v0] No reference provided")
      return NextResponse.json(
        {
          error: "Missing payment reference",
          details: "Reference parameter is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Verifying payment with reference:", reference)

    let response
    try {
      response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })
    } catch (fetchError) {
      console.error("[v0] Failed to connect to Paystack:", fetchError)
      return NextResponse.json(
        {
          error: "Payment service unavailable",
          details: "Could not connect to payment provider",
        },
        { status: 503 },
      )
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error("[v0] Failed to parse Paystack response:", jsonError)
      return NextResponse.json(
        {
          error: "Invalid response from payment service",
          details: "Could not parse payment verification response",
        },
        { status: 502 },
      )
    }

    console.log("[v0] Paystack response:", { status: response.status, dataStatus: data.status })

    if (!response.ok || !data.status) {
      console.error("[v0] Payment verification failed:", data)
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: data.message || "Payment could not be verified",
        },
        { status: 400 },
      )
    }

    // Payment successful, record votes in database
    if (data.data.status === "success") {
      console.log("[v0] Payment successful, recording votes")

      const { metadata, customer } = data.data
      const votes: Vote[] = metadata?.votes || []
      const voterEmail = customer?.email

      if (!votes.length) {
        console.error("[v0] No votes found in payment metadata")
        return NextResponse.json(
          {
            error: "Invalid payment data",
            details: "No votes found in payment",
          },
          { status: 400 },
        )
      }

      let existingVotes
      try {
        const { data: existingData, error: selectError } = await supabase
          .from("votes")
          .select("id")
          .eq("payment_reference", reference)
          .limit(1)

        if (selectError) {
          console.error("[v0] Database select error:", selectError)
          return NextResponse.json(
            {
              error: "Database error",
              details: "Could not check existing votes",
            },
            { status: 500 },
          )
        }

        existingVotes = existingData
      } catch (dbError) {
        console.error("[v0] Database connection error:", dbError)
        return NextResponse.json(
          {
            error: "Database unavailable",
            details: "Could not connect to database",
          },
          { status: 503 },
        )
      }

      if (existingVotes && existingVotes.length > 0) {
        console.log("[v0] Votes already recorded for this payment")
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
            amount_paid: 100, // 100 naira per vote
            voter_email: voterEmail,
            created_at: new Date().toISOString(),
          })
        }
      }

      console.log("[v0] Inserting", voteInserts.length, "votes")

      try {
        const { error: insertError } = await supabase.from("votes").insert(voteInserts)

        if (insertError) {
          console.error("[v0] Database insert error:", insertError)
          return NextResponse.json(
            {
              error: "Failed to record votes",
              details: "Could not save votes to database",
            },
            { status: 500 },
          )
        }
      } catch (insertDbError) {
        console.error("[v0] Database insert connection error:", insertDbError)
        return NextResponse.json(
          {
            error: "Database unavailable",
            details: "Could not save votes to database",
          },
          { status: 503 },
        )
      }

      console.log("[v0] Votes recorded successfully")

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

    console.log("[v0] Payment status not successful:", data.data.status)
    return NextResponse.json(
      {
        error: "Payment not successful",
        details: `Payment status: ${data.data.status}`,
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Unexpected error in payment verification:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred during payment verification",
      },
      { status: 500 },
    )
  }
}
