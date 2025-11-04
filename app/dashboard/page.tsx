"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import AddWalletDialog from "../components/AddWalletDialog";
import EventFeed from "../components/EventFeed";

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

	async function handleSync(address: string) {
		try {
			await fetch(`/api/wallets/sync`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address }),
			});
		} catch {}
	}

	// Explorer link map
	function getExplorerUrl(address: string, chain?: string) {
		switch (chain) {
			case "Solana":
				return `https://explorer.solana.com/address/${address}`;
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
		<div className="space-y-10">
			<h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

			{/* Portfolio Summary */}
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-1 text-lg font-semibold">Portfolio Summary</h2>
				<p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">Quick overview of your connected wallets.</p>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
						<p className="text-xs text-neutral-500">Total Wallets</p>
						<p className="mt-1 text-2xl font-semibold">{portfolio.totalWallets}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
						<p className="text-xs text-neutral-500">Portfolio Value (USD)</p>
						<p className="mt-1 text-2xl font-semibold">${portfolio.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
					</div>
					<div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
						<p className="text-xs text-neutral-500">Total SOL (estimated)</p>
						<p className="mt-1 text-2xl font-semibold">{portfolio.totalSol.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
					</div>
				</div>
			</section>
			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<h2 className="mb-1 text-lg font-semibold">Connected Wallet</h2>
				<p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">Rename your current wallet and add it to your list.</p>
				{connected && baseAddress ? (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<p className="text-sm text-neutral-500">Name</p>
							<div className="flex items-center gap-2">
								<input
									value={connectedName}
									onChange={(e) => setConnectedName(e.target.value)}
									className="w-56 rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700"
									placeholder="Enter name"
								/>
								
							</div>
							<p className="text-sm text-neutral-500">Address</p>
							<p className="font-mono text-sm break-all" title={baseAddress}>{baseAddress}</p>
						</div>
						<button
							onClick={handleAddAnother}
							className="h-9 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
						>
							+ Add Another Wallet
						</button>
					</div>
				) : (
					<p className="text-sm text-neutral-600 dark:text-neutral-300">
						Connect a wallet using the button in the navbar.
					</p>
				)}
			</section>

			<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Wallets</h2>
					<div className="flex items-center gap-3 text-xs text-neutral-500">
						{loading && <span>Loading…</span>}
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search name / coin / address"
							className="ml-2 w-64 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
						/>
						<button
							onClick={() => exportCsv(filteredWallets)}
							className="rounded-md border border-neutral-300 px-3 py-2 text-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
						>
							Export CSV
						</button>
					</div>
				</div>
				<div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
					<table className="min-w-full text-left text-sm">
						<thead className="sticky top-0 bg-neutral-50/70 backdrop-blur-sm border-b border-neutral-200 text-neutral-600 dark:bg-neutral-900/70 dark:text-neutral-300 dark:border-neutral-800">
							<tr>
								<th className="py-2 pr-4">Name</th>
								<th className="py-2 pr-4">Coin</th>
								<th className="py-2 pr-4">Address</th>
								<th className="py-2 pr-4">Total Value (USD)</th>
								<th className="py-2 pr-4">Token Count</th>
								<th className="py-2 pr-4">NFT Count</th>
								<th className="py-2 pr-4">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
							{filteredWallets.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-10 text-center text-neutral-500">
										<span>No wallets match your filters.</span>
									</td>
								</tr>
							) : (
								filteredWallets.map((w) => (
									<tr key={w.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
									<td className="py-3 pr-4">{w.name}</td>
										<td className="py-3 pr-4"><span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-[11px] dark:border-neutral-700">{w.coin ?? "Solana"}</span></td>
									<td className="py-3 pr-4 font-mono text-xs break-all" title={w.address}>{w.address}</td>
									<td className="py-3 pr-4">${(w.totalUsd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
										<td className="py-3 pr-4">{w.tokenCount ?? 0}</td>
										<td className="py-3 pr-4">{w.nftCount ?? 0}</td>
									<td className="py-3 pr-4">
											<button
												onClick={() => handleSync(w.address)}
												className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
											>
												Sync Data
											</button>
											<button
											onClick={() => copy(w.address)}
												className="ml-2 rounded-md border border-neutral-300 px-3 py-1 text-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
										>
											Copy
										</button>
											<a
											href={getExplorerUrl(w.address, w.coin)}
											target="_blank"
											rel="noreferrer"
												className="ml-2 inline-block rounded-md border border-neutral-300 px-3 py-1 text-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
										>
											Explorer
										</a>
											<button
											onClick={() => removeWallet(w.id)}
												className="ml-2 rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
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

			{/* Real-time event feed */}
			<EventFeed addresses={[baseAddress, ...wallets.map((w) => w.address)]} />

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


