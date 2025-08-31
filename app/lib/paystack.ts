// Paystack configuration and utilities
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!

export interface PaystackConfig {
  email: string
  amount: number // Amount in kobo (multiply naira by 100)
  currency: string
  reference: string
  metadata: {
    votes: Array<{
      contestantId: string
      contestantName: string
      votes: number
    }>
    totalVotes: number
  }
}

export const generatePaymentReference = () => {
  return `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const initializePaystackPayment = async (config: PaystackConfig) => {
  try {
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error("Failed to initialize payment")
    }

    return await response.json()
  } catch (error) {
    console.error("Payment initialization error:", error)
    throw error
  }
}
