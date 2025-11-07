import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Futuristic background - full screen */}
      <div className="pointer-events-none fixed inset-0 -z-10 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04060f] via-[#0b1020] to-[#050816]" />
      </div>
      <div className="relative isolate overflow-hidden min-h-screen bg-transparent text-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 pt-32 text-center sm:px-6 lg:px-10 sm:pt-40">
        {/* New emblem */}
        <div className="relative mx-auto mb-12 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_25px_60px_rgba(255,255,255,0.15)] backdrop-blur">
            <svg
              viewBox="0 0 48 48"
              className="h-10 w-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="14" width="14" height="14" rx="3" stroke="white" strokeOpacity="0.9" strokeWidth="2" />
              <rect x="28" y="6" width="14" height="14" rx="3" stroke="white" strokeOpacity="0.7" strokeWidth="2" />
              <rect x="28" y="28" width="14" height="14" rx="3" stroke="white" strokeOpacity="0.7" strokeWidth="2" />
              <path d="M20 21h8" stroke="#A5B4FC" strokeWidth="2.25" strokeLinecap="round" />
              <path d="M28 13h-8" stroke="#A5B4FC" strokeWidth="2.25" strokeLinecap="round" />
              <path d="M20 35h8" stroke="#A5B4FC" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Track all your wallets, tokens, and NFTs in one place.
        </h1>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-[#0f172a] shadow-[0_20px_40px_rgba(15,23,42,0.35)] ring-1 ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-slate-100 sm:px-10 sm:py-5 sm:text-base"
          >
            Explore Dashboard
          </Link>
          <Link
            href="/gasfee"
            className="rounded-lg border border-white/20 px-8 py-4 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:px-10 sm:py-5 sm:text-base"
          >
            Estimate Gas Fees
          </Link>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-10">
        <p className="mb-8 text-center text-sm uppercase tracking-widest text-slate-300 sm:text-base">Built for Web3</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-200 sm:text-base">
          <span className="rounded-full border border-slate-700/60 bg-slate-800/70 px-6 py-3 shadow-sm">Phantom</span>
          <span className="rounded-full border border-slate-700/60 bg-slate-800/70 px-6 py-3 shadow-sm">Solflare</span>
          <span className="rounded-full border border-slate-700/60 bg-slate-800/70 px-6 py-3 shadow-sm">Backpack</span>
          <span className="rounded-full border border-slate-700/60 bg-slate-800/70 px-6 py-3 shadow-sm">Helius</span>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">Features</h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-8 border-l border-white/10 pl-8">
          {[
            {
              title: "Unified portfolio dashboard",
              body: "Organise multiple wallets, search instantly, and export CSV reports for fast sharing.",
            },
            {
              title: "Live devnet balance sync",
              body: "Refresh SOL balances in real time, trigger airdrops, and see conversion to USD immediately.",
            },
            {
              title: "Gas fee calculator",
              body: "Estimate total SOL costs for transfers, swaps, NFTs, and smart contracts with current priority fees.",
            },
            {
              title: "Transaction insights",
              body: "Review recent signatures with automatic detection for sent, received, or swap activity.",
            },
          ].map((item, index) => (
            <div key={item.title} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-white/60" />
              <h3 className="text-xl font-semibold text-white">
                {(index + 1).toString().padStart(2, "0")} · {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
