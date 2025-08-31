"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/superbaseClient"
import { Button } from "../components/ui/Button"
import { generatePaymentReference, initializePaystackPayment } from "../lib/paystack"
import Link from "next/link"
import Image from "next/image"
interface Contestant {
  id: string
  name: string
  registration_code: string
  email: string
  bio: string
  creative_field: string
  profile_image_url?: string
}

interface VoteItem {
  contestantId: string
  contestantName: string
  votes: number
}

export default function VotePage() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [filteredContestants, setFilteredContestants] = useState<Contestant[]>([])
  const [votes, setVotes] = useState<VoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchContestants()
  }, [])

  useEffect(() => {
    // Filter contestants based on search term
    const filtered = contestants.filter((contestant) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        contestant.name.toLowerCase().includes(searchLower) ||
        contestant.registration_code.toLowerCase().includes(searchLower) ||
        contestant.creative_field.toLowerCase().includes(searchLower)
      )
    })
    setFilteredContestants(filtered)
  }, [searchTerm, contestants])

  const fetchContestants = async () => {
    try {
      const { data, error } = await supabase.from("contestants").select("*").order("name")

      console.log(data)

      if (error) throw error
      setContestants(data || [])
    } catch (error) {
      console.error("Error fetching contestants:", error)
    } finally {
      setLoading(false)
    }
  }

  const addVote = (contestant: Contestant) => {
    setVotes((prev) => {
      const existing = prev.find((v) => v.contestantId === contestant.id)
      if (existing) {
        return prev.map((v) => (v.contestantId === contestant.id ? { ...v, votes: v.votes + 1 } : v))
      } else {
        return [
          ...prev,
          {
            contestantId: contestant.id,
            contestantName: contestant.name,
            votes: 1,
          },
        ]
      }
    })
  }

  const setVoteCount = (contestant: Contestant, count: number) => {
    setVotes((prev) => {
      const existing = prev.find((v) => v.contestantId === contestant.id)
      if (count === 0) {
        return prev.filter((v) => v.contestantId !== contestant.id)
      }
      if (existing) {
        return prev.map((v) => (v.contestantId === contestant.id ? { ...v, votes: count } : v))
      } else {
        return [
          ...prev,
          {
            contestantId: contestant.id,
            contestantName: contestant.name,
            votes: count,
          },
        ]
      }
    })
  }

  const removeVote = (contestantId: string) => {
    setVotes((prev) => {
      const existing = prev.find((v) => v.contestantId === contestantId)
      if (existing && existing.votes > 1) {
        return prev.map((v) => (v.contestantId === contestantId ? { ...v, votes: v.votes - 1 } : v))
      } else {
        return prev.filter((v) => v.contestantId !== contestantId)
      }
    })
  }

  const getTotalVotes = () => votes.reduce((sum, vote) => sum + vote.votes, 0)
  const getTotalAmount = () => getTotalVotes() * 100

  const handlePayment = async () => {
    const totalVotes = getTotalVotes()
    if (totalVotes < 2) {
      alert("Minimum 2 votes required!")
      return
    }

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address!")
      return
    }

    setProcessing(true)

    try {
      const paymentConfig = {
        email,
        amount: getTotalAmount() * 100, // Convert naira to kobo
        currency: "NGN",
        reference: generatePaymentReference(),
        metadata: {
          votes,
          totalVotes,
        },
      }

      const response = await initializePaystackPayment(paymentConfig)

      if (response.status && response.data.authorization_url) {
        window.location.href = response.data.authorization_url
      } else {
        throw new Error("Failed to initialize payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment initialization failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading contestants...</div>
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
            <span className="text-[#db8f2c]">Vote</span> <span className="text-[#C0A000]">Now</span>
          </h1>
          <p className="text-gray-300 text-lg">Support your favorite contestants • ₦100 per vote • Minimum 2 votes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contestants Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BC34A]">Choose Contestants</h2>
              <div className="text-sm text-gray-400">
                {filteredContestants.length} of {contestants.length} contestants
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, registration code, or creative field..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchTerm && (
              <div className="mb-4 text-sm text-gray-400">
                {filteredContestants.length === 0 ? (
                  <span className="text-red-400">
                    
                    No contestants found matching {searchTerm}</span>
                ) : (
                  <span>
                    Found {filteredContestants.length} contestant{filteredContestants.length !== 1 ? "s" : ""} matching
                    {searchTerm}
                  </span>
                )}
              </div>
            )}

            {/* Contestants Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredContestants.map((contestant) => (
                <div
                  key={contestant.id}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-[#8BC34A]/50 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* <div className="w-16 h-16 bg-gradient-to-br from-[#8BC34A] to-[#C0A000] rounded-full flex items-center justify-center text-black font-bold text-xl">
                      {contestant.name.charAt(0)}
                    </div> */}
                   <Image
  src={contestant.profile_image_url ?? "/logo.png"}
  alt="Contestant image"
  width={64}   // equals w-16
  height={64}  // equals h-16
  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8BC34A] to-[#C0A000] flex items-center justify-center text-black font-bold text-xl object-cover"
/>

                    <div>
                      <h3 className="text-xl font-semibold text-white">{contestant.name}</h3>
                      <p className="text-[#C0A000] font-mono">#{contestant.registration_code}</p>
                      <p className="text-gray-400 text-sm">{contestant.creative_field}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{contestant.bio}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <select
                        value={votes.find((v) => v.contestantId === contestant.id)?.votes || 0}
                        onChange={(e) => setVoteCount(contestant, Number.parseInt(e.target.value))}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent"
                      >
                        <option value={0}>0 votes</option>
                        <option value={2}>2 votes</option>
                        <option value={10}>10 votes</option>
                        <option value={25}>25 votes</option>
                        <option value={50}>50 votes</option>
                        <option value={100}>100 votes</option>
                        <option value={200}>200 votes</option>
                        <option value={500}>500 votes</option>
                        <option value={1000}>1000 votes</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => removeVote(contestant.id)}
                          disabled={!votes.find((v) => v.contestantId === contestant.id)}
                          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 disabled:opacity-30"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {votes.find((v) => v.contestantId === contestant.id)?.votes || 0}
                        </span>
                        <Button
                          onClick={() => addVote(contestant)}
                          className="w-8 h-8 rounded-full bg-[#8BC34A] hover:bg-[#8BC34A]/80 text-black p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">₦100 per vote</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredContestants.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No contestants found</div>
                <Button onClick={clearSearch} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Vote Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-[#C0A000]">Vote Summary</h2>

                {votes.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No votes selected yet</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {votes.map((vote) => (
                      <div
                        key={vote.contestantId}
                        className="flex justify-between items-center py-2 border-b border-gray-700"
                      >
                        <div>
                          <div className="font-semibold text-white">{vote.contestantName}</div>
                          <div className="text-sm text-gray-400">
                            {vote.votes} vote{vote.votes > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-[#C0A000] font-semibold">₦{vote.votes * 100}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total ({getTotalVotes()} votes)</span>
                    <span className="text-[#C0A000]">₦{getTotalAmount()}</span>
                  </div>
                  {getTotalVotes() < 2 && <p className="text-red-400 text-sm mt-2">Minimum 2 votes required</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for payment"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent"
                    required
                  />
                </div>
                <p style={{ color: email ? "inherit" : "#f87171" }}>
                  {email ? "Email added" : "Please enter your email"}
                </p>

                <Button
                  onClick={handlePayment}
                  disabled={getTotalVotes() < 2 || processing || !email}
                  className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold text-lg py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {processing ? "Processing..." : `Pay ₦${getTotalAmount()}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
