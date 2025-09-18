"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/superbaseClient"
import Image from "next/image"
import Footer from "../components/ui/Footer"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    bio: "",
    creativeField: "",
    phoneNumber: "",
    whatsappNumber: "",
    location: "",
    workSample: [""], // multiple links
    socialLinks: [""], // multiple links
    profileImage: null as File | null,
  })

  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [bioWordCount, setBioWordCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement

    if (name === "profileImage" && files) {
      const file = files[0]
      setFormData({ ...formData, profileImage: file })
      setPreview(URL.createObjectURL(file))
    } else if (name === "bio") {
      const words = value
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
      const wordCount = value.trim() === "" ? 0 : words.length

      if (wordCount <= 500) {
        setFormData({ ...formData, [name]: value })
        setBioWordCount(wordCount)
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleWorkSampleChange = (index: number, value: string) => {
    const newWorkSamples = [...formData.workSample]
    newWorkSamples[index] = value
    setFormData({ ...formData, workSample: newWorkSamples })
  }

  const addWorkSample = () => {
    setFormData({ ...formData, workSample: [...formData.workSample, ""] })
  }

  const removeWorkSample = (index: number) => {
    if (formData.workSample.length > 1) {
      const newWorkSamples = formData.workSample.filter((_, i) => i !== index)
      setFormData({ ...formData, workSample: newWorkSamples })
    }
  }

  const handleSocialLinkChange = (index: number, value: string) => {
    const newSocialLinks = [...formData.socialLinks]
    newSocialLinks[index] = value
    setFormData({ ...formData, socialLinks: newSocialLinks })
  }

  const addSocialLink = () => {
    setFormData({ ...formData, socialLinks: [...formData.socialLinks, ""] })
  }

  const removeSocialLink = (index: number) => {
    if (formData.socialLinks.length > 1) {
      const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index)
      setFormData({ ...formData, socialLinks: newSocialLinks })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const registrationCode = Math.floor(100000 + Math.random() * 900000).toString()

      let profileImageUrl = null
      if (formData.profileImage) {
        const file = formData.profileImage
        const filePath = `profiles/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage.from("contestant-images").upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage.from("contestant-images").getPublicUrl(filePath)

        profileImageUrl = publicUrlData.publicUrl
      }

      const { data: existingEmail } = await supabase
        .from("contestants")
        .select("id")
        .eq("email", formData.email)
        .single()

      if (existingEmail) {
        throw new Error("This email is already registered.")
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("contestants")
        .insert([
          {
            email: formData.email,
            name: formData.name,
            bio: formData.bio,
            phone_number: formData.phoneNumber,
            whatsapp_number: formData.whatsappNumber,
            creative_field: formData.creativeField,
            location: formData.location,
            work_sample: formData.workSample.filter((link) => link.trim() !== ""),
            social_links: formData.socialLinks.filter((link) => link.trim() !== ""),
            profile_image_url: profileImageUrl,
            registration_code: registrationCode,
          },
        ])
        .select("id")
        .single()

      if (insertError) throw insertError

      if (insertedData?.id) {
        localStorage.setItem("contestantId", insertedData.id)

        try {
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              registrationCode,
              contestantId: insertedData.id,
            }),
          })

          if (!emailResponse.ok) {
            console.error("Failed to send welcome email")
          }
        } catch (emailError: unknown) {
          console.error("Email sending error:", emailError)
        }

        router.push(`/contestant/${insertedData.id}`)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        setMessage(`❌ Error: ${error.message}`)
      } else {
        console.error("Unexpected error:", error)
        setMessage("❌ An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 via-transparent to-[#C0A000]/20 blur-3xl opacity-40" />

      <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-center mb-10">
        <span className="text-[#8BC34A]">Contestant</span> <span className="text-[#C0A000]">Registration</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8 space-y-6"
      >
        {/* Email */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* Profile Image */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Profile Image</label>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full text-sm text-gray-400"
          />
          {preview && (
            <Image
              src={preview || "/placeholder.svg"}
              alt="Profile Preview"
              width={96}
              height={96}
              className="mt-4 w-24 h-24 rounded-full object-cover border border-[#8BC34A]"
            />
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">
            Short Bio
            <span className={`ml-2 text-xs ${bioWordCount > 450 ? "text-red-400" : "text-gray-400"}`}>
              ({bioWordCount}/500 words)
            </span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Tell us about yourself and your creative journey..."
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700 resize-none"
          />
          {bioWordCount > 450 && (
            <p className="text-xs text-yellow-400 mt-1">You&apos;re approaching the 500-word limit</p>
          )}
        </div>
        {/* Phone Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* WhatsApp Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">WhatsApp Number</label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* Creative Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Creative Field</label>
          <input
            type="text"
            name="creativeField"
            value={formData.creativeField}
            onChange={handleChange}
            placeholder="e.g., Music, Art, Dance"
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">State / Country</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
          />
        </div>

        {/* Work Sample */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Sample of Work (Links)</label>
          {formData.workSample.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleWorkSampleChange(index, e.target.value)}
                placeholder="https://..."
                required={index === 0}
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
              />
              {formData.workSample.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWorkSample(index)}
                  className="px-3 py-3 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addWorkSample}
            className="text-sm text-[#8BC34A] hover:text-[#8BC34A]/80 transition-colors"
          >
            + Add another work sample
          </button>
        </div>

        {/* Social Links */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[#C0A000]">Social Links</label>
          {formData.socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={link}
                onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                placeholder="Instagram, Twitter, TikTok, etc."
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-zinc-700"
              />
              {formData.socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="px-3 py-3 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialLink}
            className="text-sm text-[#8BC34A] hover:text-[#8BC34A]/80 transition-colors"
          >
            + Add another social link
          </button>
        </div>
        <Footer />
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8BC34A] to-[#C0A000] text-black font-semibold text-lg shadow-lg hover:scale-105 transition-transform"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </main>
  )
}
