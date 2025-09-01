"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "../../components/ui/Button"

export default function PaymentSuccessPage() {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // 🔍 Let's see ALL URL parameters
    const allParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      allParams[key] = value
    })
    
    console.log("🔍 ALL URL Parameters:", allParams)
    
    const reference = searchParams.get("reference")
    const trxref = searchParams.get("trxref")
    
    console.log("🔍 reference param:", reference)
    console.log("🔍 trxref param:", trxref)
    console.log("🔍 Full URL:", window.location.href)
    
    setDebugInfo(`URL Params: ${JSON.stringify(allParams, null, 2)}`)
    
    // Try both references
    const finalReference = trxref || reference
    
    if (finalReference) {
      console.log("🚀 Using reference for verification:", finalReference)
      verifyPayment(finalReference)
    } else {
      console.warn("⚠️ No reference found in URL params")
      setError("No payment reference found in URL")
      setVerifying(false)
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      console.log("🚀 Starting payment verification for:", reference)
      
      const res = await fetch(`/api/paystack/verify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      console.log("📡 Response status:", res.status)
      console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()))

      const data = await res.json()
      console.log("📡 Full API Response:", JSON.stringify(data, null, 2))

      if (!res.ok) {
        console.error("❌ Response not OK:", {
          status: res.status,
          statusText: res.statusText,
          data
        })
        throw new Error(data.details || data.error || "Payment verification failed")
      }

      if (data.success === true) {
        setSuccess(true)
        console.log("🎉 Payment verification successful!")
      } else {
        console.error("❌ Verification failed:", data)
        setError(data.details || data.error || "Payment not successful. Please try again.")
      }
    } catch (err) {
      console.error("❌ Verification error:", err)
      setError(err instanceof Error ? err.message : "Could not verify payment. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center max-w-2xl mx-auto">
      {verifying ? (
        <div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verifying your payment...</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
            <strong>Debug Info:</strong>
            <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        </div>
      ) : success ? (
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Payment Verified Successfully 🎉
          </h1>
          <p className="mt-2 text-gray-700">
            Thank you! Your vote has been recorded.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
          <p className="mt-2 text-gray-700">{error}</p>
          <div className="mt-4 p-4 bg-red-50 rounded text-left text-xs">
            <strong>Debug Info:</strong>
            <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
          <div className="mt-4 space-x-4">
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}