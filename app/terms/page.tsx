"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  title: string
  children: React.ReactNode
}

function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-600/50 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 px-2 text-left font-semibold text-lg text-gray-100 hover:text-[#8BC34A] transition-all duration-300 hover:bg-gray-800/30 rounded-lg"
      >
        <span className="pr-4">{title}</span>
        <ChevronDown
          className={`h-6 w-6 flex-shrink-0 transform transition-all duration-300 ${
            isOpen ? "rotate-180 text-[#8BC34A]" : "text-gray-400"
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-6 px-2 text-gray-300 text-base leading-relaxed animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8BC34A] via-[#9CCC65] to-[#8BC34A] bg-clip-text text-transparent mb-4">
            TERMS &amp; CONDITIONS
          </h1>
          <div className="text-2xl font-medium text-[#db8f2c] mb-6">
            7FOR7 ANNIVERSARY EVENT
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 text-lg leading-relaxed">
              These Terms &amp; Conditions (&quot;Terms&quot;) govern participation in the 7for7 Creative Anniversary Event (&quot;the Event&quot;)
              organised by Pharaoh&apos;s Hound. By registering for and participating in the Event, entrants agree to comply fully
              with these Terms.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-600/30 shadow-2xl p-8">
          <AccordionItem title="1. Eligibility">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>The Event is open to all individuals aged 18 years and above.</li>
              <li>Entrants may reside in Nigeria or outside Nigeria.</li>
              <li>Employees, affiliates, or direct partners of Pharaoh&apos;s Hound are not eligible to participate.</li>
              <li>Each participant may submit one profile/entry only.</li>
              <li>To be eligible for the Top 10, participants must secure a minimum of 3,000 verified votes via the official website.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="2. Registration &amp; Participation">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>Entrants must register on the official Pharaoh&apos;s Hound website.</li>
              <li>A confirmation link will be sent to the entrant&apos;s email to complete their profile.</li>
              <li>Participants must follow Pharaoh&apos;s Hound on official social media and engage with campaign posts.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="3. Voting System">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>Voting shall be conducted exclusively via the Pharaoh&apos;s Hound website.</li>
              <li>The voting system is powered by Paystack integration for transparency and security.</li>
              <li>Each vote may require a nominal transaction fee to validate authenticity.</li>
              <li>Manipulation of votes or fraudulent activity will result in immediate disqualification.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="4. Prizes">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>Seven winners will each receive ₦1,000,000 (One Million Naira only).</li>
              <li>For winners outside Nigeria, an equivalent value will be paid in local currency at the prevailing exchange rate.</li>
              <li>Prizes will be processed and paid within 30 working days of announcement.</li>
              <li>Prizes are non-transferable and non-exchangeable.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="5. Intellectual Property">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>All creative works submitted remain the intellectual property of the participants.</li>
              <li>By registering, participants grant Pharaoh&apos;s Hound a worldwide, royalty-free licence to use names, images, videos, and works for promotion and documentation.</li>
              <li>Pharaoh&apos;s Hound will not commercially exploit submitted works without prior consent.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="6. Data &amp; Privacy">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>Personal data (name, email, phone, state, category, etc.) will be used only for event administration, voting, and communication.</li>
              <li>Data will be stored securely in compliance with the Nigeria Data Protection Regulation (NDPR).</li>
              <li>By registering, participants consent to Pharaoh&apos;s Hound collecting and processing their data for the Event.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="7. Disqualification">
            <div className="text-base">
              Pharaoh&apos;s Hound reserves the right to disqualify participants who:
              <ul className="list-disc pl-6 mt-3 space-y-3">
                <li>Provide false or misleading information.</li>
                <li>Attempt to manipulate the voting process.</li>
                <li>Submit offensive, plagiarised, or unlawful content.</li>
                <li>Fail to comply with these Terms.</li>
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem title="8. Liability">
            <div className="text-base">
              Pharaoh&apos;s Hound shall not be responsible for:
              <ul className="list-disc pl-6 mt-3 space-y-3">
                <li>Technical failures of the website or payment gateway.</li>
                <li>Votes lost due to internet issues.</li>
                <li>Any loss, damage, or injury suffered by participants during or after the Event.</li>
              </ul>
              <p className="mt-4 font-medium text-gray-200">Participation is at the entrant&apos;s own risk.</p>
            </div>
          </AccordionItem>

          <AccordionItem title="9. Media &amp; Publicity">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>By participating, entrants grant Pharaoh&apos;s Hound the right to use their name, likeness, photos, videos, and works in promotional materials without further compensation.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="10. Modification &amp; Termination">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>Pharaoh&apos;s Hound reserves the right to modify, suspend, or terminate the Event or these Terms at any time if required.</li>
              <li>Notice of changes will be published on the official website and social media platforms.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="11. Governing Law">
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li>These Terms shall be governed by the laws of the Federal Republic of Nigeria.</li>
              <li>Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="12. Acceptance of Terms">
            <div className="text-base">
              By registering and participating in the 7for7 Event, participants confirm that they have read, understood, and agree to these Terms &amp; Conditions.
            </div>
          </AccordionItem>
        </div>
        
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-6 py-3 bg-[#db8f2c]/10 border border-[#db8f2c]/30 rounded-full">
            <span className="text-[#db8f2c] font-medium">Pharaoh&apos;s Hound &copy; 2024</span>
          </div>
        </div>
      </div>
    </div>
  )
}