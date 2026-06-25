import Link from "next/link";
import { Spade, Users, Bot, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import { PlayingCard } from "@/components/PlayingCard";
import { SoundToggle } from "@/components/SoundToggle";
import { Rank } from "@/lib/types";

const FEATURES = [
  {
    icon: Users,
    title: "Play with friends",
    desc: "Create a room, share the link, no sign-up required.",
  },
  {
    icon: Bot,
    title: "Smart bots",
    desc: "Fill empty seats or train solo against easy, medium, or hard AI.",
  },
  {
    icon: Smartphone,
    title: "Any device",
    desc: "Smooth on mobile and desktop, built for quick casual games.",
  },
];

const SHOWCASE_CARDS: { rank: Rank; suit: "spades" | "hearts" | "clubs" | "diamonds" }[] = [
  { rank: "A", suit: "spades" },
  { rank: "K", suit: "hearts" },
  { rank: "Q", suit: "clubs" },
  { rank: "2", suit: "diamonds" },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center px-6">
      <nav className="w-full max-w-5xl flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Spade className="h-5 w-5 text-amber-400" />
          Leng Ngeab Jol
        </div>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="hidden sm:inline text-sm text-slate-400 hover:text-slate-200 transition">
            Leaderboard
          </Link>
          <Link href="/history" className="hidden sm:inline text-sm text-slate-400 hover:text-slate-200 transition">
            Match History
          </Link>
          <Link href="/join" className="text-sm text-slate-400 hover:text-slate-200 transition">
            Have a room code?
          </Link>
          <SoundToggle />
        </div>
      </nav>

      <section className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center text-center gap-10 py-10">
        <div className="flex -space-x-6 animate-fade-up">
          {SHOWCASE_CARDS.map((c, i) => (
            <div
              key={i}
              className="drop-shadow-xl"
              style={{ transform: `rotate(${(i - 1.5) * 10}deg) translateY(${Math.abs(i - 1.5) * 6}px)` }}
            >
              <PlayingCard card={{ ...c, value: 0 }} />
            </div>
          ))}
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            No account needed — just pick a name
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Leng Ngeab Jol, <span className="text-amber-400">reimagined</span> for the web
          </h1>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto text-lg">
            Leng Ngeab Jol with friends or smart bots,
            right from your browser.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <Link
            href="/create"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:shadow-amber-400/30 transition"
          >
            Create Room
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-3.5 font-semibold backdrop-blur hover:bg-slate-800/80 hover:border-slate-600 transition"
          >
            Join Room
          </Link>
        </div>

        <Link
          href="/create?training=1"
          className="text-sm text-slate-500 hover:text-amber-300 transition underline-offset-4 hover:underline animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          Or train solo against 3 bots →
        </Link>
      </section>

      <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 pb-16">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-5 hover:border-amber-400/30 hover:bg-slate-900/60 transition"
          >
            <Icon className="h-5 w-5 text-amber-400 mb-3" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="sm:hidden flex items-center gap-5 pb-10 text-sm text-slate-400">
        <Link href="/leaderboard" className="hover:text-slate-200 transition">
          Leaderboard
        </Link>
        <Link href="/history" className="hover:text-slate-200 transition">
          Match History
        </Link>
      </footer>
    </main>
  );
}
