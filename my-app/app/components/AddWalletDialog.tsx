"use client";

import { useEffect, useRef, useState } from "react";

type AddWalletDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (payload: { name: string; coin: string }) => void;
	defaultName?: string;
	defaultCoin?: string;
};

export default function AddWalletDialog({ open, onClose, onSubmit, defaultName = "My Wallet", defaultCoin = "Solana" }: AddWalletDialogProps) {
	const [name, setName] = useState(defaultName);
	const [coin, setCoin] = useState(defaultCoin);
	const nameRef = useRef<HTMLInputElement | null>(null);

	const networks = [
		"Solana",
		"Ethereum",
		"Base",
		"Polygon",
		"Arbitrum",
		"Optimism",
		"Avalanche",
		"BNB Chain",
		"Sui",
		"Aptos",
	];

	useEffect(() => {
		if (open) {
			setName(defaultName);
			setCoin(defaultCoin);
			setTimeout(() => nameRef.current?.focus(), 0);
		}
	}, [open, defaultName, defaultCoin]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const finalName = name.trim() || defaultName;
		const finalCoin = coin.trim() || defaultCoin;
		onSubmit({ name: finalName, coin: finalCoin });
		onClose();
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="relative z-[61] w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
				<h3 className="mb-3 text-lg font-semibold">Add Wallet</h3>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">Wallet Name</label>
						<input
							ref={nameRef}
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700"
							placeholder="e.g., Phantom – Solana"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm text-neutral-600 dark:text-neutral-300">Network</label>
						<div className="flex flex-wrap gap-2">
							{networks.map((n) => (
								<button
									key={n}
									type="button"
									onClick={() => setCoin(n)}
									className={`rounded-md border px-3 py-1.5 text-xs transition ${
										coin === n
											? "border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
											: "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
								>
									{n}
								</button>
							))}
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2">
						<button type="button" onClick={onClose} className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
							Cancel
						</button>
						<button type="submit" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
							Add Wallet
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}


