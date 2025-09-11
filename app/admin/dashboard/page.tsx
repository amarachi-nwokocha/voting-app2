"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/superbaseClient'
import { Button } from '../../components/ui/Button'

interface VoteRecord {
  id: string
  contestant_name: string
  contestant_code: string
  vote_count: number
  amount_paid: number
  voter_email: string
  payment_reference: string
  validation_status: string
  created_at: string
  transaction_type: string
}

interface PaymentSummary {
  total_votes: number
  total_amount: number
  total_transactions: number
  unique_voters: number
}

interface Contestant {
  id: string
  name: string
  registration_code: string
  creative_field: string
}

export default function AdminDashboard() {
  const [votes, setVotes] = useState<VoteRecord[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContestant, setSelectedContestant] = useState('')
  const [voteAmount, setVoteAmount] = useState('')
  const [addingVote, setAddingVote] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const itemsPerPage = 20

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }
  }

  const fetchData = async () => {
    try {
      // Fetch all votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false })

      if (votesError) throw votesError

      // Fetch contestants
      const { data: contestantsData, error: contestantsError } = await supabase
        .from('contestants')
        .select('id, name, registration_code, creative_field')
        .order('name')

      if (contestantsError) throw contestantsError

      // Calculate summary
      const totalVotes = votesData?.reduce((sum, vote) => sum + (vote.vote_count || 0), 0) || 0
      const totalAmount = votesData?.reduce((sum, vote) => sum + (vote.amount_paid || 0), 0) || 0
      const uniqueVoters = new Set(votesData?.map(vote => vote.voter_email)).size

      setVotes(votesData || [])
      setContestants(contestantsData || [])
      setSummary({
        total_votes: totalVotes,
        total_amount: totalAmount,
        total_transactions: votesData?.length || 0,
        unique_voters: uniqueVoters
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const addManualVote = async () => {
    if (!selectedContestant || !voteAmount) return

    setAddingVote(true)
    try {
      const contestant = contestants.find(c => c.id === selectedContestant)
      const votes = parseInt(voteAmount)
      const amount = votes * 100

      const { error } = await supabase
        .from('votes')
        .insert({
          contestant_id: selectedContestant,
          contestant_name: contestant?.name,
          contestant_code: contestant?.registration_code,
          vote_count: votes,
          amount_paid: amount,
          voter_email: 'admin@system',
          payment_reference: `ADMIN_${Date.now()}`,
          validation_status: 'verified',
          transaction_type: 'admin_added',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert(`Successfully added ${votes} votes for ${contestant?.name}`)
      setSelectedContestant('')
      setVoteAmount('')
      fetchData() // Refresh data
    } catch (error: any) {
      alert(`Error adding votes: ${error.message}`)
    } finally {
      setAddingVote(false)
    }
  }

  const filteredVotes = votes.filter(vote => {
    if (filter === 'all') return true
    if (filter === 'verified') return vote.validation_status === 'verified'
    if (filter === 'pending') return vote.validation_status === 'pending'
    if (filter === 'admin') return vote.transaction_type === 'admin_added'
    return true
  })

  const paginatedVotes = filteredVotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredVotes.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-[#8BC34A]">Admin</span> <span className="text-[#C0A000]">Dashboard</span>
          </h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/')} className="bg-gray-800 hover:bg-gray-700">
              Main Site
            </Button>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-2xl font-bold text-[#8BC34A] mb-2">{summary.total_votes.toLocaleString()}</div>
              <div className="text-gray-300">Total Votes</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-2xl font-bold text-[#C0A000] mb-2">₦{summary.total_amount.toLocaleString()}</div>
              <div className="text-gray-300">Total Revenue</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-2xl font-bold text-blue-400 mb-2">{summary.total_transactions.toLocaleString()}</div>
              <div className="text-gray-300">Transactions</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-2xl font-bold text-purple-400 mb-2">{summary.unique_voters.toLocaleString()}</div>
              <div className="text-gray-300">Unique Voters</div>
            </div>
          </div>
        )}

        {/* Add Manual Votes */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-bold text-[#8BC34A] mb-4">Add Manual Votes</h2>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Contestant</label>
              <select
                value={selectedContestant}
                onChange={(e) => setSelectedContestant(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC34A] text-white"
              >
                <option value="">Select contestant...</option>
                {contestants.map((contestant) => (
                  <option key={contestant.id} value={contestant.id}>
                    {contestant.name} (#{contestant.registration_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Votes</label>
              <input
                type="number"
                value={voteAmount}
                onChange={(e) => setVoteAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC34A] text-white"
                placeholder="Enter votes..."
                min="1"
              />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Amount: ₦{voteAmount ? (parseInt(voteAmount) * 100).toLocaleString() : '0'}
              </div>
            </div>
            <div>
              <Button
                onClick={addManualVote}
                disabled={!selectedContestant || !voteAmount || addingVote}
                className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold"
              >
                {addingVote ? 'Adding...' : 'Add Votes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Votes Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#8BC34A]">All Votes & Payments</h2>
            <div className="flex gap-2">
              {['all', 'verified', 'pending', 'admin'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    filter === filterType
                      ? 'bg-[#8BC34A] text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Contestant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Votes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Voter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedVotes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(vote.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{vote.contestant_name}</div>
                      <div className="text-gray-400 text-xs">#{vote.contestant_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#8BC34A]">
                      {vote.vote_count?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#C0A000]">
                      ₦{vote.amount_paid?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {vote.voter_email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        vote.validation_status === 'verified' 
                          ? 'bg-green-900 text-green-300'
                          : vote.validation_status === 'pending'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {vote.validation_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {vote.transaction_type || 'bulk_vote'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {vote.payment_reference?.substring(0, 15)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVotes.length)} of {filteredVotes.length} votes
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-gray-700 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-gray-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
