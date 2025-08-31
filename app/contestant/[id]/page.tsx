"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/superbaseClient"
import { useParams, useRouter } from "next/navigation"
import { Button } from "../../components/ui/Button"
import Link from "next/link"
import Image from "next/image" // ✅ import Next.js optimized Image

interface Contestant {
  id: string
  email: string
  name: string
  bio: string
  creative_field: string
  location: string
  work_sample: string[]
  social_links: string[]
  profile_image_url: string | null
  registration_code: string
  created_at: string
}

export default function ContestantPage() {
  const params = useParams()
  const router = useRouter()
  const [contestant, setContestant] = useState<Contestant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const verifyContestant = async () => {
      if (!params.id) {
        setError("Invalid contestant ID")
        setLoading(false)
        return
      }

      const storedContestantId = localStorage.getItem("contestantId")
      if (!storedContestantId || storedContestantId !== params.id) {
        setError("Please login to view this profile")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("contestants")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error || !data) throw new Error("Contestant not found")
        setContestant(data as Contestant)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching contestant:", err.message)
        } else {
          console.error("Unexpected error:", err)
        }
        setError("Contestant not found or access denied")
      } finally {
        setLoading(false)
      }
    }

    verifyContestant()
  }, [params.id])

  const handleLogout = () => {
    localStorage.removeItem("contestantId")
    router.push("/login")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Verifying contestant...</div>
      </main>
    )
  }

  if (error || !contestant) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />

        <div className="relative z-10 text-center">
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              {error ||
                "The requested contestant could not be found or you don't have permission to view this profile."}
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold hover:scale-105 transition-transform"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-blue-900/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#8BC34A]/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#C0A000]/10 rounded-full blur-2xl" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                <span className="text-[#8BC34A]">Contestant</span>{" "}
                <span className="text-[#C0A000]">Profile</span>
              </h1>
              <div className="inline-block bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black px-4 py-2 rounded-full font-semibold mb-2">
                Registration Code: {contestant.registration_code}
              </div>
              <p className="text-gray-400 text-sm">
                Your password for login is your registration code above
              </p>
            </div>
          </div>

          <div className="flex items-center gap-10 align-baseline justify-center mb-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black bg-transparent"
            >
              Logout
            </Button>
            <Button className="inline-block bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black px-4 py-2 font-semibold">
              <Link href="/votes">Vote</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {contestant.profile_image_url ? (
                <Image
                  src={contestant.profile_image_url}
                  alt={contestant.name}
                  width={192}
                  height={192}
                  className="w-48 h-48 rounded-2xl object-cover border-2 border-[#8BC34A]"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-zinc-800 flex items-center justify-center border-2 border-[#8BC34A]">
                  <span className="text-4xl text-gray-400">👤</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#C0A000] mb-2">{contestant.name}</h2>
                <p className="text-[#8BC34A] text-lg font-medium">{contestant.creative_field}</p>
                <p className="text-gray-400">{contestant.location}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#C0A000] mb-2">Bio</h3>
                <p className="text-gray-300 leading-relaxed">{contestant.bio}</p>
              </div>

              {/* Work Samples */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#C0A000] mb-2">Work Samples</h3>
                {contestant.work_sample?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {contestant.work_sample.map((rawLink, idx) => {
                      const link = rawLink.replace(/[{}]/g, "")
                      return (
                        <li key={idx}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8BC34A] hover:underline break-all text-sm"
                          >
                            {link}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No work samples provided</p>
                )}
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#C0A000] mb-2">Social Links</h3>
                {contestant.social_links?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 w-1/2">
                    {contestant.social_links.map((rawLink, idx) => {
                      const link = rawLink.replace(/[{}]/g, "")
                      return (
                        <li key={idx}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8BC34A] hover:underline break-all text-sm"
                          >
                            {link}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No social links provided</p>
                )}
              </div>

              {/* Email */}
              <div>
                <h3 className="text-lg font-semibold text-[#C0A000] mb-2">Contact Email</h3>
                <p className="text-gray-300 text-sm">{contestant.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
