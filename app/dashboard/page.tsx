"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
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
	const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null);
	const [airdropping, setAirdropping] = useState(false);
	const [connectedName, setConnectedName] = useState<string>("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
// removed refresh-all state
	const [searchQuery, setSearchQuery] = useState("");
	const baseAddress = useMemo(() => publicKey?.toBase58() ?? "", [publicKey]);

	function shortenAddress(addr: string) {
		return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : "";
	}

	const portfolio = useMemo(() => {
		const totalUsd = wallets.reduce((sum, w) => sum + (w.totalUsd || 0), 0);
		const totalSol = wallets
			.filter((w) => w.coin === "Solana")
			.reduce((sum, w) => sum + (w.balanceSol || 0), 0);
		return {
			totalWallets: wallets.length,
			totalUsd,
			totalSol,
		};
	}, [wallets]);

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
			const response = await fetch(`/api/wallets/airdrop`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address: baseAddress, amount: 2 }),
			});

			if (!response.ok) {
				throw new Error("Failed to airdrop SOL");
			}

			const result = await response.json();
			if (result.ok) {
				// Auto-sync after airdrop to update the balance
				setTimeout(() => {
					handleSync(baseAddress);
				}, 1000);
			}
		} catch (error) {
			console.error("Error airdropping SOL:", error);
			alert("Failed to airdrop SOL. Make sure you're on devnet.");
		} finally {
			setAirdropping(false);
		}
	}

	async function handleSync(address: string) {
		// Find the wallet being synced
		const wallet = wallets.find((w) => w.address === address);
		if (!wallet) return;

		setSyncingWalletId(wallet.id);
		try {
			const response = await fetch(`/api/wallets/sync`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address }),
			});

			if (!response.ok) {
				throw new Error("Failed to sync wallet");
			}

			const result = await response.json();
			if (result.ok && result.data) {
				// Update the wallet with synced data
				setWallets((prev) =>
					prev.map((w) =>
						w.id === wallet.id
							? {
									...w,
									balanceSol: result.data.balanceSol,
									totalUsd: result.data.totalUsd,
									tokenCount: result.data.tokenCount,
									nftCount: result.data.nftCount,
									lastUpdatedMs: result.data.lastUpdatedMs,
								}
							: w
					)
				);
			}
		} catch (error) {
			console.error("Error syncing wallet:", error);
			// You could show a toast notification here
		} finally {
			setSyncingWalletId(null);
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
		<div className="space-y-12">
			<h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>

			{/* Portfolio Summary */}
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-8 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-2 text-2xl font-semibold">Portfolio Summary</h2>
				<p className="mb-6 text-base text-neutral-500 dark:text-neutral-400">Quick overview of your connected wallets.</p>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Total Wallets</p>
						<p className="mt-2 text-4xl font-semibold">{portfolio.totalWallets}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Portfolio Value (USD)</p>
						<p className="mt-2 text-4xl font-semibold">${portfolio.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
						<p className="text-sm font-medium text-neutral-500">Total SOL (estimated)</p>
						<p className="mt-2 text-4xl font-semibold">{portfolio.totalSol.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
					</div>
				</div>
			</section>
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-8 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-2 text-2xl font-semibold">Connected Wallet</h2>
				<p className="mb-6 text-base text-neutral-500 dark:text-neutral-400">Rename your current wallet and add it to your list.</p>
				{connected && baseAddress ? (
					<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-3">
							<div>
								<p className="mb-2 text-sm font-medium text-neutral-500">Name</p>
								<input
									value={connectedName}
									onChange={(e) => setConnectedName(e.target.value)}
									className="w-64 rounded-md border border-neutral-300 bg-transparent px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700"
									placeholder="Enter name"
								/>
							</div>
							<div>
								<p className="mb-2 text-sm font-medium text-neutral-500">Address</p>
								<p className="font-mono text-base break-all" title={baseAddress}>{baseAddress}</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<button
								onClick={handleAirdrop}
								disabled={airdropping}
								className="h-12 rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{airdropping ? "Airdropping..." : "🪂 Airdrop 2 SOL (Devnet)"}
							</button>
							<button
								onClick={handleAddAnother}
								className="h-12 rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
							>
								+ Add Another Wallet
							</button>
						</div>
					</div>
				) : (
					<p className="text-base text-neutral-600 dark:text-neutral-300">
						Connect a wallet using the button in the navbar.
					</p>
				)}
			</section>

			<section className="rounded-xl border border-neutral-200 bg-white/90 p-8 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Wallets</h2>
					<div className="flex items-center gap-4">
						{loading && <span className="text-base">Loading…</span>}
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search name / coin / address"
							className="w-72 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
						/>
						<button
							onClick={() => exportCsv(filteredWallets)}
							className="rounded-md border border-neutral-300 px-5 py-2.5 text-base font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
						>
							Export CSV
						</button>
					</div>
				</div>
				<div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
					<table className="min-w-full text-left text-base">
						<thead className="sticky top-0 bg-neutral-50/70 backdrop-blur-sm border-b border-neutral-200 text-neutral-600 dark:bg-neutral-900/70 dark:text-neutral-300 dark:border-neutral-800">
							<tr>
								<th className="py-4 px-4 font-semibold">Name</th>
								<th className="py-4 px-4 font-semibold">Coin</th>
								<th className="py-4 px-4 font-semibold">Address</th>
								<th className="py-4 px-4 font-semibold">Total Value (USD)</th>
								<th className="py-4 px-4 font-semibold">Token Count</th>
								<th className="py-4 px-4 font-semibold">NFT Count</th>
								<th className="py-4 px-4 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
							{filteredWallets.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-12 text-center text-base text-neutral-500">
										<span>No wallets match your filters.</span>
									</td>
								</tr>
							) : (
								filteredWallets.map((w) => (
									<tr key={w.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
										<td className="py-4 px-4 font-medium">{w.name}</td>
										<td className="py-4 px-4"><span className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-1 text-sm font-medium dark:border-neutral-700">{w.coin ?? "Solana"}</span></td>
										<td className="py-4 px-4 font-mono text-sm break-all" title={w.address}>{w.address}</td>
										<td className="py-4 px-4 font-semibold">${(w.totalUsd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
										<td className="py-4 px-4">{w.tokenCount ?? 0}</td>
										<td className="py-4 px-4">{w.nftCount ?? 0}</td>
										<td className="py-4 px-4">
											<div className="flex items-center gap-2 flex-wrap">
												<button
													onClick={() => copy(w.address)}
													className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
												>
													Copy
												</button>
												<a
													href={getExplorerUrl(w.address, w.coin)}
													target="_blank"
													rel="noreferrer"
													className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
												>
													Explorer
												</a>
												<button
													onClick={() => handleSync(w.address)}
													disabled={syncingWalletId === w.id}
													className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
												>
													{syncingWalletId === w.id ? "Syncing..." : "Sync Data"}
												</button>
												<button
													onClick={() => removeWallet(w.id)}
													className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
												>
													Remove
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>

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


