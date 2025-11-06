"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/70 backdrop-blur-xl shadow-sm dark:border-neutral-800 dark:bg-neutral-950/70">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
				<nav className="flex items-center gap-8">
					<Link href="/" className="flex items-center gap-3 font-semibold">
						<svg 
							xmlns="http://www.w3.org/2000/svg" 
							viewBox="0 0 24 24" 
							fill="none" 
							stroke="currentColor" 
							strokeWidth="2" 
							strokeLinecap="round" 
							strokeLinejoin="round"
							className="h-8 w-8 text-purple-600 dark:text-purple-400"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.35-4.35" />
							<circle cx="11" cy="11" r="3" fill="currentColor" />
						</svg>
						<span className="text-xl tracking-wide sm:text-2xl">BlockLens</span>
					</Link>
					<ul className="hidden items-center gap-3 text-base sm:flex">
						<li><Link href="/dashboard" className="rounded-lg px-4 py-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">Dashboard</Link></li>
					</ul>
				</nav>
				<div className="flex items-center gap-3">
					{mounted ? (
						<div className="wallet-adapter-button-trigger">
							<WalletMultiButton className="!rounded-lg !text-base !bg-neutral-900 hover:!bg-neutral-800 dark:!bg-white dark:!text-neutral-900 dark:hover:!bg-neutral-200" />
						</div>
					) : (
						<div className="h-11 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
					)}
				</div>
			</div>
		</header>
	);
}


