import { type NextRequest, NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, currency, reference, metadata } = body

    // ✅ Fixed: Include reference in callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/votes/success?reference=${reference}`

    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // Amount in kobo
        currency: currency || "NGN",
        reference,
        metadata,
        callback_url: callbackUrl,  // ✅ Use the URL with reference
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack initialization failed:", data)
      return NextResponse.json({ error: "Failed to initialize payment", details: data }, { status: 400 })
    }

    console.log("✅ Payment initialized successfully:", {
      reference,
      authorization_url: data.data?.authorization_url,
      callback_url: callbackUrl
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}