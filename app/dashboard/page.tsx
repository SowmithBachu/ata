"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import AddWalletDialog from "../components/AddWalletDialog";

type TrackedWallet = {
	id: string;
	name: string;
	address: string;
	coin?: string;
	totalUsd?: number;
	tokenCount?: number;
	nftCount?: number;
	lastUpdatedMs?: number;
	balanceSol?: number; // for Solana only
};

export default function DashboardPage() {
	const { connected, publicKey } = useWallet();
const { connection } = useConnection();
	const [wallets, setWallets] = useState<TrackedWallet[]>([]);
	const [loading, setLoading] = useState(false);
	const [airdropping, setAirdropping] = useState(false);
	const [connectedName, setConnectedName] = useState<string>("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
// removed refresh-all state
	const [searchQuery, setSearchQuery] = useState("");
	const baseAddress = useMemo(() => publicKey?.toBase58() ?? "", [publicKey]);
	const [connectedSol, setConnectedSol] = useState<number | null>(null);
	const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);
	const [selectedWalletForTransactions, setSelectedWalletForTransactions] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [loadingTransactions, setLoadingTransactions] = useState(false);

	function shortenAddress(addr: string) {
		return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : "";
	}

	const portfolio = useMemo(() => {
		const totalUsd = wallets.reduce((sum, w) => sum + (w.totalUsd || 0), 0);
		const totalSol = wallets
			.filter((w) => w.coin === "Solana")
			.reduce((sum, w) => sum + (w.balanceSol || 0), 0);
		
		// Add connected wallet's SOL balance to USD total if connected
		const connectedSolUsd = connectedSol && solPriceUsd ? connectedSol * solPriceUsd : 0;
		const totalUsdWithConnected = totalUsd + connectedSolUsd;
		
		return {
			totalWallets: wallets.length,
			totalUsd: totalUsdWithConnected,
			totalSol: totalSol + (connectedSol || 0),
		};
	}, [wallets, connectedSol, solPriceUsd]);

	const filteredWallets = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return wallets;
		return wallets.filter((w) =>
			(w.name || "").toLowerCase().includes(q) ||
			(w.coin || "").toLowerCase().includes(q) ||
			(w.address || "").toLowerCase().includes(q)
		);
	}, [wallets, searchQuery]);

	useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			try {
				// Prefer localStorage cache first
				const cached = typeof window !== "undefined" ? localStorage.getItem("wallets") : null;
				if (cached) {
					const parsed = JSON.parse(cached) as TrackedWallet[];
					if (!ignore) setWallets(parsed);
				} else {
					// Fallback to API (currently returns empty array)
					const res = await fetch("/api/wallets", { cache: "no-store" });
					if (res.ok) {
						const data = (await res.json()) as TrackedWallet[];
						if (!ignore) setWallets(data);
					} else {
						if (!ignore) setWallets([]);
					}
				}
			} catch (e) {
				if (!ignore) setWallets([]);
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => {
			ignore = true;
		};
	}, []);

	// Persist to localStorage when wallets change
	useEffect(() => {
		if (typeof window === "undefined") return;
		localStorage.setItem("wallets", JSON.stringify(wallets));
	}, [wallets]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const saved = localStorage.getItem("connectedName");
		if (saved) setConnectedName(saved);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		localStorage.setItem("connectedName", connectedName);
	}, [connectedName]);

// Helper: refresh connected SOL balance
async function refreshConnectedSolLocal() {
    try {
        if (!publicKey) {
            setConnectedSol(null);
            return;
        }
        const lamports = await connection.getBalance(publicKey);
        setConnectedSol(lamports / LAMPORTS_PER_SOL);
    } catch {
        setConnectedSol(null);
    }
}

	// Fetch live SOL balance for the connected wallet
	useEffect(() => {
		let cancelled = false;
		async function fetchBalance() {
			try {
				if (!publicKey) {
					setConnectedSol(null);
					return;
				}
				const lamports = await connection.getBalance(publicKey);
				if (!cancelled) setConnectedSol(lamports / LAMPORTS_PER_SOL);
			} catch {
				if (!cancelled) setConnectedSol(null);
			}
		}
		fetchBalance();
		return () => {
			cancelled = true;
		};
	}, [connection, publicKey]);

// Periodically refresh while connected
useEffect(() => {
    if (!publicKey) return;
    const id = setInterval(() => { void refreshConnectedSolLocal(); }, 15000);
    return () => clearInterval(id);
}, [publicKey]);

	// Fetch current SOL price in USD
	useEffect(() => {
		let cancelled = false;
		async function fetchPrice() {
			try {
				const res = await fetch("/api/prices/sol", { cache: "no-store" });
				if (!res.ok) return;
				const data = await res.json();
				const price = Number(data?.price);
				if (!cancelled && Number.isFinite(price)) setSolPriceUsd(price);
			} catch (error) {
				console.error("Failed to fetch SOL price:", error);
			}
		}
		fetchPrice();
		// Refresh price every 60 seconds
		const interval = setInterval(() => {
			if (!cancelled) fetchPrice();
		}, 60000);
		return () => { 
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	function handleAddAnother() {
		if (!baseAddress) return;
		setIsDialogOpen(true);
	}

	function handleDialogSubmit(payload: { name: string; coin: string }) {
		if (!baseAddress) return;
		setWallets((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				name: payload.name,
				coin: payload.coin,
				address: baseAddress,
				totalUsd: 0,
				tokenCount: 0,
				nftCount: 0,
				lastUpdatedMs: Date.now(),
			},
		]);
	}

	async function handleAirdrop() {
		if (!baseAddress) return;

		setAirdropping(true);
		try {
			// Add timeout to prevent long waits
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
			
			const response = await fetch(`/api/wallets/airdrop`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address: baseAddress, amount: 2 }),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

            // parse response safely (text or json)
            let result: any = null;
            const text = await response.text();
            try { result = JSON.parse(text); } catch { result = { ok: false, error: text }; }
            if (!response.ok || !result?.ok) {
                const message = typeof result?.error === "string" ? result.error : "Failed to airdrop SOL";
				// Friendly handling for faucet rate limits
                if (response.status === 429 || result?.code === 429 || (typeof message === "string" && message.includes("429"))) {
					const faucetUrl = result?.faucetUrl || `https://faucet.solana.com/?cluster=devnet&wallet=${baseAddress}`;
					const userMessage = `${message}\n\nThe devnet faucet has strict rate limits. Would you like to open the official faucet to request SOL manually?`;
					if (confirm(userMessage)) {
						try { window.open(faucetUrl, "_blank"); } catch {}
					}
				} else {
					alert(message);
				}
				return;
			}
            if (result.ok) {
                // Refresh connected SOL immediately
                void refreshConnectedSolLocal();
			}
		} catch (error: any) {
			console.error("Error airdropping SOL:", error);
			if (error.name === "AbortError") {
				alert("Airdrop request timed out. The devnet faucet may be rate-limited. Please try using the official faucet or try again later.");
				try { window.open(`https://faucet.solana.com/?cluster=devnet&wallet=${baseAddress}`, "_blank"); } catch {}
			} else {
				alert("Failed to airdrop SOL. Make sure you're on devnet.");
			}
		} finally {
			setAirdropping(false);
		}
	}

	// Explorer link map
	function getExplorerUrl(address: string, chain?: string) {
		switch (chain) {
			case "Solana":
				return `https://explorer.solana.com/address/${address}?cluster=devnet`;
			case "Ethereum":
				return `https://etherscan.io/address/${address}`;
			case "Base":
				return `https://basescan.org/address/${address}`;
			case "Polygon":
				return `https://polygonscan.com/address/${address}`;
			default:
				return "#";
		}
	}

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {}
	}

	function removeWallet(id: string) {
		setWallets((prev) => prev.filter((w) => w.id !== id));
	}

	async function fetchTransactions(address: string) {
		setLoadingTransactions(true);
		setSelectedWalletForTransactions(address);
		try {
			const res = await fetch("/api/wallets/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address, limit: 20 }),
			});
			if (res.ok) {
				const data = await res.json();
				if (data.ok) {
					setTransactions(data.data);
				} else {
					setTransactions([]);
				}
			} else {
				setTransactions([]);
			}
		} catch (error) {
			console.error("Failed to fetch transactions:", error);
			setTransactions([]);
		} finally {
			setLoadingTransactions(false);
		}
	}

	function closeTransactions() {
		setSelectedWalletForTransactions(null);
		setTransactions([]);
	}

	function getTransactionExplorerUrl(signature: string, chain?: string) {
		switch (chain) {
			case "Solana":
				return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
			case "Ethereum":
				return `https://etherscan.io/tx/${signature}`;
			case "Base":
				return `https://basescan.org/tx/${signature}`;
			case "Polygon":
				return `https://polygonscan.com/tx/${signature}`;
			default:
				return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
		}
	}

// removed refresh-all logic

	function exportCsv(rows: TrackedWallet[]) {
		const headers = [
			"id",
			"name",
			"coin",
			"address",
			"balanceSol",
			"totalUsd",
			"tokenCount",
			"nftCount",
			"lastUpdatedMs",
		];
		const lines = [headers.join(",")].concat(
			rows.map((w) =>
				[
					w.id,
					JSON.stringify(w.name || ""),
					w.coin || "",
					w.address,
					w.balanceSol ?? "",
					w.totalUsd ?? "",
					w.tokenCount ?? "",
					w.nftCount ?? "",
					w.lastUpdatedMs ?? "",
				].join(",")
			)
		);
		const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `wallets-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

// removed auto-refresh interval

	return (
		<div className="space-y-12 text-slate-100">
			<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>

			{/* Portfolio Summary */}
			<section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.01] p-8 shadow-[0_40px_120px_rgba(79,70,229,0.25)] backdrop-blur">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="text-left">
						<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Portfolio</p>
						<h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Real-time pulse</h2>
						<p className="mt-2 max-w-xl text-sm text-slate-300">Track the health of every wallet at a glance — balances, USD value, and live SOL holdings update automatically.</p>
					</div>
				</div>
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-slate-300">Wallets</p>
						<p className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{portfolio.totalWallets}</p>
						<p className="mt-2 text-xs text-slate-400">Tracked across all chains</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-slate-300">Portfolio USD</p>
						<p className="mt-3 text-3xl font-semibold text-white sm:text-4xl">${(portfolio.totalUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
						<p className="mt-2 text-xs text-slate-400">Includes connected wallet SOL</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.3em] text-slate-300">Live SOL</p>
						<p className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{(connectedSol ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
						<p className="mt-2 text-xs text-slate-400">Updated every 15 seconds</p>
					</div>
				</div>
			</section>
			<section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-[0_35px_110px_rgba(15,23,42,0.55)]">
				<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.35em] text-slate-300">Tracked wallets</p>
						<h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Portfolio directory</h2>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						{loading && <span className="text-sm text-slate-300">Loading…</span>}
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search name, coin, or address"
							className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
						/>
						<button
							onClick={() => exportCsv(filteredWallets)}
							className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
						>
							Export CSV
						</button>
					</div>
				</div>
				<div className="overflow-hidden rounded-2xl border border-white/10">
					<table className="min-w-full text-left text-sm text-slate-200">
						<thead className="sticky top-0 bg-white/10 backdrop-blur-sm text-slate-200">
 							<tr>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Name</th>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Coin</th>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Address</th>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Tokens</th>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">NFTs</th>
								<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Actions</th>
 							</tr>
 						</thead>
						<tbody className="divide-y divide-white/5">
 							{filteredWallets.length === 0 ? (
 								<tr>
									<td colSpan={6} className="py-12 text-center text-sm text-slate-400">
										<span>No wallets match your filters.</span>
									</td>
								</tr>
							) : (
								filteredWallets.map((w) => (
									<tr key={w.id} className="transition hover:bg-white/10">
										<td className="py-3 px-4 font-medium text-white">{w.name}</td>
										<td className="py-3 px-4"><span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200">{w.coin ?? "Solana"}</span></td>
 										<td className="py-3 px-4" title={w.address}>
 											<div className="flex items-center gap-2">
												<span className="font-mono text-xs break-all text-slate-200 sm:text-sm">{w.address}</span>
												<button
													onClick={() => copy(w.address)}
													className="rounded-lg border border-white/15 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-white/15"
												>
													Copy
												</button>
											</div>
										</td>
										<td className="py-3 px-4 text-slate-200">{w.tokenCount ?? 0}</td>
										<td className="py-3 px-4 text-slate-200">{w.nftCount ?? 0}</td>
										<td className="py-3 px-4">
											<button
												onClick={() => removeWallet(w.id)}
												className="rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/30"
											>
												Remove
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>

			{/* Transaction History Section */}
			{selectedWalletForTransactions && (
				<section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.45)] backdrop-blur">
					<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<p className="text-xs uppercase tracking-[0.35em] text-slate-300">Timeline</p>
							<h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Transaction History</h2>
							<p className="mt-2 text-sm text-slate-300">
								{(() => {
									const wallet = wallets.find((w) => w.address === selectedWalletForTransactions);
									return wallet ? `${wallet.name} (${shortenAddress(selectedWalletForTransactions)})` : shortenAddress(selectedWalletForTransactions);
								})()}
							</p>
						</div>
						<button
							onClick={closeTransactions}
							className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
						>
							Close
						</button>
					</div>
					{loadingTransactions ? (
						<div className="py-12 text-center">
							<p className="text-sm text-slate-400">Loading transactions...</p>
						</div>
					) : transactions.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-sm text-slate-400">No transactions found for this wallet.</p>
						</div>
					) : (
						<div className="overflow-hidden rounded-2xl border border-white/10">
							<table className="min-w-full text-left text-sm text-slate-200">
								<thead className="sticky top-0 bg-white/10 backdrop-blur-sm">
									<tr>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Type</th>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Amount (SOL)</th>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Status</th>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Time</th>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Signature</th>
										<th className="py-3 px-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/5">
									{transactions.map((tx) => (
										<tr key={tx.signature} className="transition hover:bg-white/10">
											<td className="py-3 px-4">
												<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
													tx.type === "sent" 
														? "bg-red-500/20 text-red-200"
														: tx.type === "received"
														? "bg-emerald-500/20 text-emerald-200"
														: tx.type === "swap"
														? "bg-indigo-500/20 text-indigo-200"
														: "bg-white/10 text-slate-200"
												}`}> 
													{tx.type === "sent" ? "↗ Sent" : tx.type === "received" ? "↙ Received" : tx.type === "swap" ? "⇄ Swap" : "• Other"}
												</span>
											</td>
											<td className="py-3 px-4 font-semibold text-white">
												{tx.solAmount > 0 ? `${tx.solAmount.toFixed(4)} SOL` : "-"}
											</td>
											<td className="py-3 px-4">
												<span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
													tx.status === "success"
														? "bg-emerald-500/20 text-emerald-200"
														: "bg-red-500/20 text-red-200"
												}`}> 
													{tx.status === "success" ? "✓ Success" : "✗ Failed"}
												</span>
											</td>
											<td className="py-3 px-4 text-xs text-slate-400">
												{tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : "Unknown"}
											</td>
											<td className="py-3 px-4">
												<div className="flex items-center gap-2">
													<span className="font-mono text-xs text-slate-200" title={tx.signature}>
														{tx.signature.slice(0, 16)}...
													</span>
													<button
														onClick={() => copy(tx.signature)}
														className="rounded-lg border border-white/15 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-white/15"
													>
														Copy
													</button>
												</div>
											</td>
											<td className="py-3 px-4">
												<a
													href={getTransactionExplorerUrl(tx.signature, wallets.find((w) => w.address === selectedWalletForTransactions)?.coin)}
													target="_blank"
													rel="noreferrer"
													className="inline-block rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
												>
													View
												</a>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			)}

			<AddWalletDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSubmit={handleDialogSubmit}
				defaultName={connectedName || "My Wallet"}
				defaultCoin="Solana"
			/>
		</div>
	);
}


