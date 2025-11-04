import Link from "next/link";
import DemoButton from "./components/DemoButton";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {/* Futuristic background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* gradient mesh */}
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[140vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500 opacity-25 blur-3xl" />
        {/* soft glows */}
        <div className="absolute bottom-20 left-10 h-56 w-56 animate-pulse rounded-full bg-fuchsia-500/20 blur-2xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 animate-[spin_35s_linear_infinite] rounded-full bg-cyan-500/10 blur-2xl" />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.04)_1px,_transparent_1px)] bg-[length:18px_18px] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_1px,_transparent_1px)]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pt-28">
        {/* Subtle wallet icon animation: orbiting dots */}
        <div className="relative mx-auto mb-8 h-20 w-20">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600/15 ring-1 ring-indigo-600/30 shadow-[0_0_30px_rgba(79,70,229,0.25)]" />
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-indigo-500" />
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400" />
          <span className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 rounded-full bg-purple-400" />
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-400" />
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full" />
        </div>
        <h1 className="text-balance bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent drop-shadow-sm dark:from-fuchsia-200 dark:via-indigo-200 dark:to-cyan-200 sm:text-6xl">
          Track all your Solana wallets, tokens, and NFTs in one place.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-neutral-600 dark:text-neutral-300">
          Unified analytics for Web3 portfolios.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Launch App
          </Link>
          <DemoButton />
        </div>
        {/* Glass panel */}
        <div className="pointer-events-none mx-auto mt-8 hidden max-w-4xl rounded-xl border border-white/10 bg-white/5 p-[1px] shadow-[inset_0_1px_20px_rgba(255,255,255,0.06)] backdrop-blur-sm dark:block">
          <div className="h-12 rounded-[10px] bg-gradient-to-r from-white/5 to-white/0" />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="group rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
            <div className="mb-3 text-2xl">💼</div>
            <h3 className="mb-2 text-lg font-semibold">Manage multiple wallets seamlessly</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Add, view, and switch between wallets with ease.
            </p>
          </div>
          <div className="group rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
            <div className="mb-3 text-2xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold">Real-time token and NFT analytics</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Track balances, values, and collections in one dashboard.
            </p>
          </div>
          <div className="group rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
            <div className="mb-3 text-2xl">🤖</div>
            <h3 className="mb-2 text-lg font-semibold">AI insights for smarter decisions</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Surface trends and opportunities across your portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <p className="mb-6 text-center text-sm uppercase tracking-widest text-neutral-500">Built for the Solana ecosystem</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Phantom</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Solflare</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Magic Eden</span>
          <span className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">Jupiter</span>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-14 text-center dark:border-neutral-900 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-3xl">
          <h4 className="text-xl font-semibold">Built for Solana users. Start tracking in seconds.</h4>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Launch App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
