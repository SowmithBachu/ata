"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050816]/70 backdrop-blur-sm">
			<div className="flex w-full items-center px-4 py-4 sm:px-6 lg:px-10">
				<Link href="/" className="flex items-center">
					<span
						className="text-4xl font-normal tracking-tight text-white"
						style={{ fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif" }}
					>
						BlockLens
					</span>
				</Link>
				<div className="ml-auto flex items-center gap-4">
                    {pathname !== "/" && (
                        <nav className="hidden items-center gap-3 text-sm text-slate-200 sm:flex">
                            <Link href="/dashboard" className="rounded-lg px-3 py-2 transition hover:bg-white/10">
                                Dashboard
                            </Link>
                            <Link href="/gasfee" className="rounded-lg px-3 py-2 transition hover:bg-white/10">
                                Gas Fee Calculator
                            </Link>
                        </nav>
                    )}
                    {mounted && pathname !== "/" && (
                        <div className="wallet-adapter-button-trigger">
                            <WalletMultiButton className="!rounded-lg !border !border-white/20 !bg-white/10 !px-4 !py-2 text-sm !text-white !backdrop-blur hover:!bg-white/20" />
                        </div>
                    )}
                </div>
			</div>
		</header>
	);
}


