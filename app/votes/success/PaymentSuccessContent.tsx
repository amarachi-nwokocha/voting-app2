"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "../../components/ui/Button"

export default function PaymentSuccessContent() {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const reference = searchParams.get("reference")
    if (reference) {
      verifyPayment(reference)
    } else {
      setError("No payment reference found")
      setVerifying(false)
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      console.log("[v0] Making request to /api/paystack/verify with reference:", reference)

      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] Expected JSON but got:", contentType, "Response:", textResponse.substring(0, 200))
        setError(`Server returned ${contentType || "unknown content type"} instead of JSON`)
        return
      }

      const data = await response.json()
      console.log("[v0] Parsed response data:", data)

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.error || "Payment verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#8BC34A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl">Verifying your payment...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {success ? (
          <div>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-[#8BC34A]">Payment Successful!</h1>
            <p className="text-gray-300 mb-8">
              Your votes have been recorded successfully. Thank you for supporting the contestants!
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/votes")}
                className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold py-3 rounded-xl hover:scale-105 transition-transform"
              >
                Vote Again
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full border-[#8BC34A] text-[#8BC34A] hover:bg-[#8BC34A] hover:text-black py-3 rounded-xl bg-transparent"
              >
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-400">Payment Failed</h1>
            <p className="text-gray-300 mb-8">{error}</p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/votes")}
                className="w-full bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold py-3 rounded-xl hover:scale-105 transition-transform"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full border-[#8BC34A] text-[#8BC34A] hover:bg-[#8BC34A] hover:text-black py-3 rounded-xl bg-transparent"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
