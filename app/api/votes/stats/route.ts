import { NextResponse } from "next/server"
import { supabase } from "../../../lib/superbaseClient"

export async function GET() {
  try {
    // Get voting statistics using the database function
    const { data: stats, error: statsError } = await supabase.rpc("get_voting_stats")

    if (statsError) {
      console.error("Stats error:", statsError)
      return NextResponse.json({ error: "Failed to fetch voting statistics" }, { status: 500 })
    }

    // Get contestant vote counts
    const { data: contestants, error: contestantsError } = await supabase
      .from("contestant_vote_counts")
      .select("*")
      .order("total_votes", { ascending: false })

    if (contestantsError) {
      console.error("Contestants error:", contestantsError)
      return NextResponse.json({ error: "Failed to fetch contestant data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: stats[0] || {
          total_votes: 0,
          total_amount: 0,
          unique_voters: 0,
          top_contestant_name: null,
          top_contestant_votes: 0,
        },
        contestants: contestants || [],
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
