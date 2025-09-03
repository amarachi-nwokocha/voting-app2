import Link from "next/link"

export default function Footer() {
  return (
    <footer className="text-center py-2 text-gray-400 text-lg">
      <p>
        Participation in this event is subject to our{" "}
        <Link href="/terms" className="text-[#8BC34A] hover:underline font-medium">
          Terms & Conditions
        </Link>.
      </p>
    </footer>
  )
}
