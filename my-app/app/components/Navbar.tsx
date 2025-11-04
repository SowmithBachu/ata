"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function ThemeToggle() {
	const [theme, setTheme] = useState<string | null>(null);

	useEffect(() => {
		// Initialize theme from localStorage or system preference
		const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
		const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		const initial = stored || (prefersDark ? "dark" : "light");
		setTheme(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);

	function toggleTheme() {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		if (typeof window !== "undefined") {
			localStorage.setItem("theme", next);
		}
		document.documentElement.classList.toggle("dark", next === "dark");
	}

	return (
		<button
			onClick={toggleTheme}
			aria-label="Toggle theme"
			className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
		>
			{theme === "dark" ? (
				// Sun icon
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
					<path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 0 1-1v-1a1 1 0 1 0-2 0v1a1 1 0 0 0 1 1Zm0-20a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1Zm10 9h-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2ZM3 12a1 1 0 0 0-1-1H1a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1Zm15.657 7.071.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414ZM4.222 4.222a1 1 0 0 0 0 1.414l.707.707A1 1 0 0 0 6.343 4.93l-.707-.707a1 1 0 0 0-1.414 0Zm14.849 1.414.707-.707A1 1 0 1 0 18.364 3.515l-.707.707A1 1 0 0 0 19.07 5.636ZM5.636 19.071l-.707.707a1 1 0 0 0 1.414 1.414l.707-.707a1 1 0 1 0-1.414-1.414Z" />
				</svg>
			) : (
				// Moon icon
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
					<path d="M21.752 15.002A9 9 0 0 1 9.002 2.252 9.003 9.003 0 1 0 21.752 15.002Z" />
				</svg>
			)}
			<span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
		</button>
	);
}

export default function Navbar() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/70 backdrop-blur-xl shadow-sm dark:border-neutral-800 dark:bg-neutral-950/70">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
				<nav className="flex items-center gap-6">
					<Link href="/" className="flex items-center gap-2 font-semibold">
						<span className="inline-block h-7 w-7 rounded-md bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500" />
						<span className="text-sm tracking-wide">ATA</span>
					</Link>
					<ul className="hidden items-center gap-2 text-sm sm:flex">
						<li><Link href="/" className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">Dashboard</Link></li>
						<li><Link href="/watchlist" className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">Watchlist</Link></li>
						<li><Link href="/insights" className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">AI Insights</Link></li>
						<li><Link href="/settings" className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">Settings</Link></li>
					</ul>
				</nav>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					{mounted ? (
						<div className="wallet-adapter-button-trigger">
							<WalletMultiButton className="!rounded-md !text-sm !bg-neutral-900 hover:!bg-neutral-800 dark:!bg-white dark:!text-neutral-900 dark:hover:!bg-neutral-200" />
						</div>
					) : (
						<div className="h-9 w-28 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
					)}
				</div>
			</div>
		</header>
	);
}


