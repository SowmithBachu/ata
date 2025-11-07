"use client";

import { useEffect, useState } from "react";

export default function GasFeeCalculatorPage() {
	const [feeData, setFeeData] = useState<any>(null);
	const [loadingFees, setLoadingFees] = useState(false);
	const [customTxCount, setCustomTxCount] = useState<string>("");
	const [selectedTxType, setSelectedTxType] = useState<string>("simpleTransfer");
	const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);
	const [calculatedResult, setCalculatedResult] = useState<{ count: number; totalFee: number } | null>(null);

	// Fetch current SOL price in USD
	useEffect(() => {
		let cancelled = false;
		async function fetchPrice() {
			try {
				const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", { cache: "no-store" });
				if (!res.ok) return;
				const data = await res.json();
				const price = data?.solana?.usd;
				if (!cancelled && typeof price === "number") setSolPriceUsd(price);
			} catch {}
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

	// Fetch network fees
	useEffect(() => {
		let cancelled = false;
		async function fetchFees() {
			setLoadingFees(true);
			try {
				const res = await fetch("/api/fees", { cache: "no-store" });
				if (!res.ok) return;
				const data = await res.json();
				if (!cancelled && data.ok) {
					setFeeData(data.data);
				}
			} catch (e) {
				console.error("Failed to fetch fees:", e);
			} finally {
				if (!cancelled) setLoadingFees(false);
			}
		}
		fetchFees();
		// Refresh fees every 30 seconds
		const interval = setInterval(() => {
			if (!cancelled) fetchFees();
		}, 30000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Gas Fee Calculator</h1>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
					Calculate transaction fees for Solana network operations
				</p>
			</div>

			{loadingFees ? (
				<section className="rounded-xl border border-neutral-200 bg-white/90 p-12 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
					<div className="text-center">
						<p className="text-sm text-neutral-500">Loading fee data...</p>
					</div>
				</section>
			) : feeData ? (
				<div className="space-y-6">
					{/* Current Network Fees */}
					<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
						<h2 className="mb-4 text-xl font-semibold sm:text-2xl">Current Network Fees</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
								<p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Base Fee</p>
								<p className="text-xl font-bold text-neutral-900 dark:text-white">
									{feeData.baseFee.sol.toFixed(8)} SOL
								</p>
								{solPriceUsd && (
									<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
										${(feeData.baseFee.sol * solPriceUsd).toFixed(6)} USD
									</p>
								)}
							</div>
							<div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
								<p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Avg Priority Fee</p>
								<p className="text-xl font-bold text-neutral-900 dark:text-white">
									{(feeData.prioritizationFees.average / 1e9).toFixed(8)} SOL
								</p>
								{solPriceUsd && (
									<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
										${((feeData.prioritizationFees.average / 1e9) * solPriceUsd).toFixed(6)} USD
									</p>
								)}
							</div>
							<div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
								<p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Median Priority Fee</p>
								<p className="text-xl font-bold text-neutral-900 dark:text-white">
									{(feeData.prioritizationFees.median / 1e9).toFixed(8)} SOL
								</p>
								{solPriceUsd && (
									<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
										${((feeData.prioritizationFees.median / 1e9) * solPriceUsd).toFixed(6)} USD
									</p>
								)}
							</div>
						</div>
					</section>

					{/* Fee Estimates by Transaction Type */}
					<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
						<h2 className="mb-4 text-xl font-semibold sm:text-2xl">Estimated Fees by Transaction Type</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{Object.entries(feeData.estimates).map(([type, estimate]: [string, any]) => {
								const typeLabels: Record<string, string> = {
									simpleTransfer: "Simple Transfer",
									tokenTransfer: "Token Transfer",
									swap: "DEX Swap",
									nftTransfer: "NFT Transfer",
									smartContract: "Smart Contract",
								};
								return (
									<div key={type} className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
										<p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
											{typeLabels[type] || type}
										</p>
										<p className="text-lg font-bold text-neutral-900 dark:text-white">
											{estimate.sol.toFixed(8)} SOL
										</p>
										{solPriceUsd && (
											<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
												${(estimate.sol * solPriceUsd).toFixed(6)} USD
											</p>
										)}
									</div>
								);
							})}
						</div>
					</section>

					{/* Custom Fee Calculator */}
					<section className="rounded-xl border border-neutral-200 bg-white/90 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
						<div className="rounded-lg border border-neutral-200 bg-neutral-100/80 p-6 dark:border-neutral-800 dark:bg-neutral-800/60">
							<h2 className="mb-4 text-xl font-semibold sm:text-2xl">Calculate Total Fees</h2>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
										Transaction Type
									</label>
									<select
										value={selectedTxType}
										onChange={(e) => {
											setSelectedTxType(e.target.value);
											setCalculatedResult(null); // Reset result when type changes
										}}
										className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
									>
										<option value="simpleTransfer">Simple Transfer</option>
										<option value="tokenTransfer">Token Transfer</option>
										<option value="swap">DEX Swap</option>
										<option value="nftTransfer">NFT Transfer</option>
										<option value="smartContract">Smart Contract</option>
									</select>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
										Number of Transactions
									</label>
									<input
										type="number"
										min="1"
										max="1000"
										value={customTxCount}
										onChange={(e) => {
											setCustomTxCount(e.target.value);
											setCalculatedResult(null); // Reset result when input changes
										}}
										placeholder="Enter number of transactions"
										className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
									/>
								</div>
							</div>
							<div className="mt-4">
								<button
									onClick={() => {
										const count = parseInt(customTxCount);
										if (count && count >= 1 && count <= 1000 && feeData) {
											const selectedEstimate = feeData.estimates[selectedTxType];
											const totalFeeSol = selectedEstimate.sol * count;
											setCalculatedResult({ count, totalFee: totalFeeSol });
										}
									}}
									disabled={!customTxCount || parseInt(customTxCount) < 1 || parseInt(customTxCount) > 1000}
									className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
								>
									Calculate
								</button>
							</div>
							{calculatedResult && feeData && (
								<div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
									<p className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Estimated Fee</p>
									<p className="text-2xl font-bold text-neutral-900 dark:text-white">
										{calculatedResult.totalFee.toFixed(8)} SOL
									</p>
									{solPriceUsd && (
										<p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
											${(calculatedResult.totalFee * solPriceUsd).toFixed(4)} USD
										</p>
									)}
									<p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
										{feeData.estimates[selectedTxType].sol.toFixed(8)} SOL per transaction × {calculatedResult.count} transaction{calculatedResult.count !== 1 ? "s" : ""}
									</p>
								</div>
							)}
						</div>
					</section>
				</div>
			) : (
				<section className="rounded-xl border border-neutral-200 bg-white/90 p-12 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/20">
					<div className="text-center">
						<p className="text-sm text-neutral-500">Unable to load fee data. Please try again later.</p>
					</div>
				</section>
			)}
		</div>
	);
}

