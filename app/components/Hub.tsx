import Link from "next/link";
import { UserPlus, Vote, Trophy, PersonStanding } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
const cards = [
  {
    title: "Register",
    description: "Sign up and create your contestant profile.",
    href: "/register",
    icon: UserPlus,
  },
  {
    title: "Vote",
    description: "Support your favorite contestant.",
    href: "/votes",
    icon: Vote,
  },
  {
    title: "Login",
    description: "See your progress so far.",
    href: "/login",
    icon: PersonStanding,
  },
  {
    title: "Leaderboard",
    description: "See who's leading in real-time.",
    href: "/votes/results",
    icon: Trophy,
  },
];

export default function HubPage() {
  return (
    <main className="min-h-screen bg-black text-[#db8f2c] flex flex-col items-center justify-center px-6 py-12">
      <Image
        src="/logo.png"
        alt="Tattoo Shop Logo"
        width={140}
        height={40}
        className="object-contain mb-6"
      />

      <h1 className="text-4xl font-bold mb-10 text-center">
        PHAROAH&apos;S <span className="text-white">HOUNDS</span> HUB
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="p-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition shadow-lg flex flex-col items-center text-center"
          >
            <Icon className="w-12 h-12 mb-4 text-[#db8f2c]" />
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-zinc-400">{description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
