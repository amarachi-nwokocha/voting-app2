"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "../components/ui/Button"
import { supabase } from "../lib/superbaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [registrationCode, setRegistrationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Query the contestants table to verify email and registration code
      const { data: contestant, error: queryError } = await supabase
        .from("contestants")
        .select("id, email, registration_code")
        .eq("email", email)
        .eq("registration_code", registrationCode)
        .single()

      if (queryError || !contestant) {
        setError("Invalid email or registration code")
        setIsLoading(false)
        return
      }

      // Store the contestant ID in localStorage for session management
      localStorage.setItem("contestantId", contestant.id.toString())

      // Redirect to the contestant's profile page
      router.push(`/contestant/${contestant.id}`)
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/10 via-transparent to-[#C0A000]/10 blur-3xl opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,195,74,0.1),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#8BC34A]">Welcome</span> <span className="text-[#C0A000]">Back</span>
          </h1>
          <p className="text-gray-400">Login with your email and registration code</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="registrationCode" className="block text-sm font-medium text-gray-200">
              Registration Code
            </label>
            <input
              id="registrationCode"
              type="text"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0A000] focus:border-transparent transition-all duration-200"
              placeholder="Enter your registration code"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold py-3 rounded-lg hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#8BC34A] hover:text-[#C0A000] transition-colors font-medium underline-offset-4 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
