import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import RegistrationSuccessEmail from "../../emails/registration-success"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Email API called")

    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] Missing RESEND_API_KEY environment variable")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const { email, name, registrationCode, contestantId } = await request.json()

    console.log("[v0] Sending email to:", email)

    const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/contestant/${contestantId}`

    const { data, error } = await resend.emails.send({
      from: "Pharoah's Hound Tattoo Studios <inquiries@pharoahshoundtattoostudios.com>",
      to: [email],
      subject: "🎉 Registration Successful - Your Contest Profile is Ready!",
      react: RegistrationSuccessEmail({
        name,
        registrationCode,
        profileUrl,
      }),
    })

    if (error) {
      console.log("[v0] Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.log("[v0] Email sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
