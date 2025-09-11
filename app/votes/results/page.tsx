"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import Link from "next/link"
import CountdownTimer from "../../components/ui/Countdown"

interface VoteStats {
  total_votes: number
  total_amount: number
  unique_voters: number
  top_contestant_name: string | null
  top_contestant_votes: number
}

interface ContestantStats {
  id: string
  name: string
  registration_code: string
  creative_field: string
  total_votes: number
  total_amount_raised: number
}

export default function VoteResultsPage() {
  const [stats, setStats] = useState<VoteStats | null>(null)
  const [contestants, setContestants] = useState<ContestantStats[]>([])
  const [loading, setLoading] = useState(true)
 const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(contestants.length / itemsPerPage);

  // Slice contestants for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContestants = contestants.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  useEffect(() => {
    fetchVoteStats()
  }, [])

  const fetchVoteStats = async () => {
    try {
      const response = await fetch("/api/votes/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data.overview)
        setContestants(data.data.contestants)
      }
    } catch (error) {
      console.error("Error fetching vote stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">← Back to Hub</Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-4">
            <span className="text-[#8BC34A]">Vote</span> <span className="text-[#C0A000]">Results</span>
          </h1>
          <p className="text-gray-300 text-lg">Live voting statistics and leaderboard</p>
        </div>
        <div>
          <CountdownTimer /> 
        </div>
        {/* Overview Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center">
              <div className="text-3xl font-bold text-[#8BC34A] mb-2">{stats.total_votes}</div>
              <div className="text-gray-300">Total Votes</div>
            </div> */}
            {/* <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center">
              <div className="text-3xl font-bold text-[#C0A000] mb-2">
                {stats.unique_voters > 0 ? Math.round(stats.total_votes / stats.unique_voters) : 0}
              </div>
              <div className="text-gray-300">Avg Votes/Voter</div>
            </div> */}
            {/* <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.unique_voters}</div>
              <div className="text-gray-300">Unique Voters</div>
            </div> */}
            {/* <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 text-center">
              <div className="text-lg font-bold text-white mb-1">{stats.top_contestant_name || "N/A"}</div>
              <div className="text-sm text-gray-300">Leading with {stats.top_contestant_votes} votes</div>
            </div> */}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-[#8BC34A]">Leaderboard</h2>
      </div>

      {/* Contestants */}
      <div className="divide-y divide-gray-700">
        {currentContestants.map((contestant, index) => (
          <div
            key={contestant.id}
            className="p-6 flex items-center justify-between hover:bg-gray-800/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#8BC34A] to-[#C0A000] text-black font-bold">
                {startIndex + index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {contestant.name}
                </h3>
                <p className="text-[#C0A000] font-mono">
                  #{contestant.registration_code}
                </p>
                <p className="text-gray-400 text-sm">
                  {contestant.creative_field}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#8BC34A]">
                {contestant.total_votes}
              </div>
              <div className="text-sm text-gray-400">votes</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t border-gray-700">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-gray-700 transition"
        >
          Previous
        </button>

        <span className="text-gray-300">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-gray-700 transition"
        >
          Next
        </button>
      </div>
    </div>

        <div className="text-center mt-8">
          <Link href="/votes">
            <Button className="bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold text-lg px-8 py-3 rounded-xl hover:scale-105 transition-transform">
              Vote Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
// import React from 'react'

// const page = () => {
//   return (
//     <div className='text-center mt-20 text-3xl'>
//       Loading....
//     </div>
//   )
// }

// export default page