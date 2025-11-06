import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Futuristic background - full screen */}
      <div className="pointer-events-none fixed inset-0 -z-10 w-full h-full">
        {/* Base background */}
        <div className="absolute inset-0 bg-white dark:bg-neutral-950" />
        {/* gradient mesh */}
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[140vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500 opacity-25 blur-3xl" />
        {/* soft glows */}
        <div className="absolute bottom-20 left-10 h-56 w-56 animate-pulse rounded-full bg-fuchsia-500/20 blur-2xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 animate-[spin_35s_linear_infinite] rounded-full bg-cyan-500/10 blur-2xl" />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.04)_1px,_transparent_1px)] bg-[length:18px_18px] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_1px,_transparent_1px)]" />
      </div>
      <div className="relative isolate overflow-hidden min-h-screen bg-transparent text-neutral-900 dark:text-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 text-center sm:pt-40">
        {/* Subtle wallet icon animation: orbiting dots */}
        <div className="relative mx-auto mb-12 h-28 w-28">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600/15 ring-1 ring-indigo-600/30 shadow-[0_0_30px_rgba(79,70,229,0.25)]" />
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-indigo-500" />
          <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-400" />
          <span className="absolute left-1/2 bottom-0 h-3 w-3 -translate-x-1/2 rounded-full bg-purple-400" />
          <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-blue-400" />
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full" />
        </div>
        <h1 className="text-balance bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent drop-shadow-sm dark:from-fuchsia-200 dark:via-indigo-200 dark:to-cyan-200 sm:text-6xl lg:text-7xl">
          Track all your wallets, tokens, and NFTs in one place.
        </h1>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-neutral-900 px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:px-10 sm:py-5 sm:text-base"
          >
            Launch App
          </Link>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <p className="mb-8 text-center text-sm uppercase tracking-widest text-neutral-500 sm:text-base">Built for Web3</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-700 dark:text-neutral-300 sm:text-base">
          <span className="rounded-full border border-neutral-200 bg-white/80 px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Phantom</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Solflare</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Magic Eden</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Jupiter</span>
        </div>
      </section>
      </div>
    </>
  );
}
