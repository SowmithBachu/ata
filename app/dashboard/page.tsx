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
		<div className="space-y-8">
			<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>

			{/* Portfolio Summary */}
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-2 text-xl font-semibold sm:text-2xl">Portfolio Summary</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Total Wallets</p>
						<p className="mt-2 text-3xl font-semibold sm:text-4xl">{portfolio.totalWallets}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Total Value (USD)</p>
						<p className="mt-2 text-3xl font-semibold sm:text-4xl">${(portfolio.totalUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Connected SOL</p>
						<p className="mt-2 text-3xl font-semibold sm:text-4xl">{(connectedSol ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
					</div>
				</div>
			</section>
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-6 text-xl font-semibold sm:text-2xl">Connected Wallet</h2>
				{connected && baseAddress ? (
					<div className="space-y-6">
						{/* Wallet Info Grid */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{/* Name Input */}
							<div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
								<label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
									Wallet Name
								</label>
								<input
									value={connectedName}
									onChange={(e) => setConnectedName(e.target.value)}
									className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
									placeholder="Enter wallet name"
								/>
							</div>

							{/* Address Display */}
							<div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
								<label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
									Wallet Address
								</label>
								<div className="flex items-center gap-2">
									<p className="flex-1 font-mono text-xs break-all text-neutral-900 dark:text-neutral-100" title={baseAddress}>
										{baseAddress}
									</p>
									<button
										onClick={() => copy(baseAddress)}
										className="flex-shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
									>
										Copy
									</button>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div className="border-t border-neutral-200 dark:border-neutral-800"></div>

						{/* Action Buttons */}
						<div>
							<p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Quick Actions</p>
							<div className="flex flex-wrap gap-3">
								<button
									onClick={handleAirdrop}
									disabled={airdropping}
									className="h-10 flex-shrink-0 rounded-lg bg-green-600 px-4 sm:px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
								>
									{airdropping ? "Airdropping..." : "🪂 Airdrop 2 SOL"}
								</button>
								<button
									onClick={() => fetchTransactions(baseAddress)}
									disabled={loadingTransactions && selectedWalletForTransactions === baseAddress}
									className="h-10 flex-shrink-0 rounded-lg border border-purple-300 bg-purple-50 px-4 sm:px-6 py-2 text-sm font-medium text-purple-700 shadow-sm transition-colors hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/40 whitespace-nowrap"
								>
									{loadingTransactions && selectedWalletForTransactions === baseAddress ? "Loading..." : "📜 View Transactions"}
								</button>
								<button
									onClick={handleAddAnother}
									className="h-10 flex-shrink-0 rounded-lg bg-neutral-900 px-4 sm:px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 whitespace-nowrap"
								>
									+ Add to Portfolio
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="py-12 text-center">
						<p className="text-sm text-neutral-600 dark:text-neutral-300 sm:text-base">
							Connect a wallet using the button in the navbar to get started.
						</p>
					</div>
				)}
			</section>

			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<div className="mb-4 flex items-center justify-between flex-wrap gap-4">
					<h2 className="text-xl font-semibold sm:text-2xl">Wallets</h2>
					<div className="flex items-center gap-3 flex-wrap">
						{loading && <span className="text-sm">Loading…</span>}
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search name / coin / address"
							className="w-full sm:w-64 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
						/>
						<button
							onClick={() => exportCsv(filteredWallets)}
							className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
						>
							Export CSV
						</button>
					</div>
				</div>
				<div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
					<table className="min-w-full text-left text-sm">
						<thead className="sticky top-0 bg-neutral-50/70 backdrop-blur-sm border-b border-neutral-200 text-neutral-600 dark:bg-neutral-900/70 dark:text-neutral-300 dark:border-neutral-800">
							<tr>
								<th className="py-3 px-4 font-semibold">Name</th>
								<th className="py-3 px-4 font-semibold">Coin</th>
								<th className="py-3 px-4 font-semibold">Address</th>
								<th className="py-3 px-4 font-semibold">Token Count</th>
								<th className="py-3 px-4 font-semibold">NFT Count</th>
								<th className="py-3 px-4 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
							{filteredWallets.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-12 text-center text-sm text-neutral-500">
										<span>No wallets match your filters.</span>
									</td>
								</tr>
							) : (
								filteredWallets.map((w) => (
									<tr key={w.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
										<td className="py-3 px-4 font-medium">{w.name}</td>
										<td className="py-3 px-4"><span className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium dark:border-neutral-700">{w.coin ?? "Solana"}</span></td>
                                        <td className="py-3 px-4" title={w.address}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs break-all sm:text-sm">{w.address}</span>
                                                <button
                                                    onClick={() => copy(w.address)}
                                                    className="rounded-lg border border-neutral-300 px-2 py-1 text-[10px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </td>
										<td className="py-3 px-4">{w.tokenCount ?? 0}</td>
										<td className="py-3 px-4">{w.nftCount ?? 0}</td>
										<td className="py-3 px-4">
											<button
												onClick={() => removeWallet(w.id)}
												className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
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
				<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold sm:text-2xl">Transaction History</h2>
							<p className="mt-1 text-sm text-neutral-500">
								{(() => {
									const wallet = wallets.find((w) => w.address === selectedWalletForTransactions);
									return wallet ? `${wallet.name} (${shortenAddress(selectedWalletForTransactions)})` : shortenAddress(selectedWalletForTransactions);
								})()}
							</p>
						</div>
						<button
							onClick={closeTransactions}
							className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
						>
							Close
						</button>
					</div>
					{loadingTransactions ? (
						<div className="py-12 text-center">
							<p className="text-sm text-neutral-500">Loading transactions...</p>
						</div>
					) : transactions.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-sm text-neutral-500">No transactions found for this wallet.</p>
						</div>
					) : (
						<div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
							<table className="min-w-full text-left text-sm">
								<thead className="sticky top-0 bg-neutral-50/70 backdrop-blur-sm border-b border-neutral-200 text-neutral-600 dark:bg-neutral-900/70 dark:text-neutral-300 dark:border-neutral-800">
									<tr>
										<th className="py-3 px-4 font-semibold">Type</th>
										<th className="py-3 px-4 font-semibold">Amount (SOL)</th>
										<th className="py-3 px-4 font-semibold">Status</th>
										<th className="py-3 px-4 font-semibold">Time</th>
										<th className="py-3 px-4 font-semibold">Signature</th>
										<th className="py-3 px-4 font-semibold">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
									{transactions.map((tx) => (
										<tr key={tx.signature} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
											<td className="py-3 px-4">
												<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
													tx.type === "sent" 
														? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
														: tx.type === "received"
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
														: tx.type === "swap"
														? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
														: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
												}`}>
													{tx.type === "sent" ? "↗ Sent" : tx.type === "received" ? "↙ Received" : tx.type === "swap" ? "⇄ Swap" : "• Other"}
												</span>
											</td>
											<td className="py-3 px-4 font-semibold">
												{tx.solAmount > 0 ? `${tx.solAmount.toFixed(4)} SOL` : "-"}
											</td>
											<td className="py-3 px-4">
												<span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
													tx.status === "success"
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
														: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
												}`}>
													{tx.status === "success" ? "✓ Success" : "✗ Failed"}
												</span>
											</td>
											<td className="py-3 px-4 text-xs text-neutral-500">
												{tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : "Unknown"}
											</td>
											<td className="py-3 px-4">
												<div className="flex items-center gap-2">
													<span className="font-mono text-xs" title={tx.signature}>
														{tx.signature.slice(0, 16)}...
													</span>
													<button
														onClick={() => copy(tx.signature)}
														className="rounded-lg border border-neutral-300 px-2 py-1 text-[10px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
													className="inline-block rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
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


