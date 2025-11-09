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

      {/* Social Links Footer */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="flex items-center gap-8">
            <a
              href="https://x.com/SowmithB15858"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
              aria-label="X (Twitter)"
            >
              <div className="rounded-full border border-white/20 bg-white/5 p-4 backdrop-blur-sm transition-all group-hover:border-white/40 group-hover:bg-white/10 group-hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)]">
                <svg
                  className="h-6 w-6 text-slate-300 transition-colors group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-xs text-slate-400 transition-colors group-hover:text-slate-200">X</span>
            </a>
            <a
              href="https://github.com/SowmithBachu"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
              aria-label="GitHub"
            >
              <div className="rounded-full border border-white/20 bg-white/5 p-4 backdrop-blur-sm transition-all group-hover:border-white/40 group-hover:bg-white/10 group-hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)]">
                <svg
                  className="h-6 w-6 text-slate-300 transition-colors group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xs text-slate-400 transition-colors group-hover:text-slate-200">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/sowmith-bachu-1160492b3/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
              aria-label="LinkedIn"
            >
              <div className="rounded-full border border-white/20 bg-white/5 p-4 backdrop-blur-sm transition-all group-hover:border-white/40 group-hover:bg-white/10 group-hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)]">
                <svg
                  className="h-6 w-6 text-slate-300 transition-colors group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <span className="text-xs text-slate-400 transition-colors group-hover:text-slate-200">LinkedIn</span>
            </a>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
