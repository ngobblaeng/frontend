import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Tiến Lên Online</h1>
        <p className="mt-3 text-slate-400 max-w-md mx-auto">
          Play Cambodian &amp; Vietnamese card games with friends or smart bots.
          No account needed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/create"
          className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition"
        >
          Create Room
        </Link>
        <Link
          href="/join"
          className="rounded-lg border border-slate-600 px-8 py-3 font-semibold hover:bg-slate-800 transition"
        >
          Join Room
        </Link>
      </div>

      <Link href="/create?training=1" className="text-sm text-slate-500 hover:text-slate-300 underline">
        Or train solo against 3 bots
      </Link>
    </main>
  );
}
