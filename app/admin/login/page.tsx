"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/superbaseClient'
import { Button } from '../../components/ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin
      console.log('🔍 Checking admin status for user:', data.user.id)
      console.log('🔍 User email:', data.user.email)
      
      const { data: profile, error: profileError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      console.log('🔍 Admin profile query result:', profile)
      console.log('🔍 Admin profile error:', profileError)

      if (profileError) {
        console.error('❌ Profile error details:', profileError)
        await supabase.auth.signOut()
        throw new Error(`Database error: ${profileError.message}. Make sure you've been added as an admin.`)
      }

      if (!profile) {
        console.error('❌ No admin profile found for user')
        await supabase.auth.signOut()
        throw new Error('No admin profile found. Contact an administrator to add your account.')
      }

      if (profile.role !== 'admin') {
        console.error('❌ User role is not admin:', profile.role)
        await supabase.auth.signOut()
        throw new Error(`Invalid role: ${profile.role}. Admin role required.`)
      }

      console.log('✅ Admin verification successful')
      console.log('✅ User profile:', profile)
      console.log('🚀 Attempting to redirect to dashboard...')

      setSuccess(true)
      
      // Force redirect with replace instead of push
      setTimeout(async () => {
        await router.replace('/admin/dashboard')
        console.log('✅ Redirect command executed')
      }, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
          <h1 className="text-3xl font-bold text-center mb-8">
            <span className="text-[#8BC34A]">Admin</span> <span className="text-[#C0A000]">Portal</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC34A] text-white"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC34A] text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
                <p className="text-green-400 text-sm mb-2">Login successful! Redirecting...</p>
                <button
                  onClick={() => router.replace('/admin/dashboard')}
                  className="text-green-300 underline text-sm"
                >
                  Click here if not redirected automatically
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#8BC34A] hover:underline text-sm">
              ← Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
