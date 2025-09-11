"use client"

import { Button } from '../../components/ui/Button'
import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-red-800/20 blur-3xl opacity-40" />
      
      <div className="relative z-10 text-center max-w-md mx-auto p-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-red-800">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-300 mb-8">
            You don&apos;t have admin privileges to access this area. Please contact an administrator if you believe this is an error.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold"
            >
              Go to Main Site
            </Button>
            <Button 
              onClick={() => router.push('/admin/login')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            >
              Try Different Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
