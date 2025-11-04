"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EventFeedProps = {
	addresses: string[];
};

type HeliusMessage = {
	// Keep generic to handle various channel payloads
	[key: string]: any;
};

export default function EventFeed({ addresses }: EventFeedProps) {
	const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
	const cluster = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as string) || "mainnet-beta";
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [events, setEvents] = useState<HeliusMessage[]>([]);
	const wsRef = useRef<WebSocket | null>(null);
	const retryRef = useRef<number>(0);

	const uniqueAddresses = useMemo(() => {
		return Array.from(new Set(addresses.filter(Boolean)));
	}, [addresses]);

	useEffect(() => {
		if (!apiKey || uniqueAddresses.length === 0) {
			return;
		}

		let closed = false;
		function connect() {
			const url = `wss://stream.helius.dev?api-key=${apiKey}&cluster=${encodeURIComponent(cluster)}`;
			const ws = new WebSocket(url);
			wsRef.current = ws;
			setError(null);

			ws.onopen = () => {
				setConnected(true);
				retryRef.current = 0;
				// Try subscribing to account_activity; some accounts may require account_updates depending on plan/version
				const subscribePrimary = {
					type: "subscribe",
					channels: [
						{ name: "account_activity", addresses: uniqueAddresses },
					],
				};
				ws.send(JSON.stringify(subscribePrimary));
				// Also try a secondary channel to maximize compatibility
				const subscribeSecondary = {
					type: "subscribe",
					channels: [
						{ name: "account_updates", addresses: uniqueAddresses },
					],
				};
				ws.send(JSON.stringify(subscribeSecondary));
			};

			ws.onmessage = (ev) => {
				try {
					const msg = JSON.parse(ev.data as string);
					setEvents((prev) => {
						const next = [msg, ...prev];
						return next.slice(0, 50);
					});
				} catch (e) {
					// ignore malformed messages
				}
			};

			ws.onerror = (evt: Event) => {
				setError("WebSocket error (check API key and network)");
			};

			ws.onclose = (evt: CloseEvent) => {
				setConnected(false);
				if (closed) return;
				// Reconnect with exponential backoff up to ~30s
				const attempt = Math.min(retryRef.current + 1, 6);
				retryRef.current = attempt;
				const timeoutMs = Math.pow(2, attempt) * 500;
				setTimeout(() => {
					if (!closed) connect();
				}, timeoutMs);
			};
		}

		connect();

		return () => {
			closed = true;
			try {
				wsRef.current?.close();
			} catch {}
		};
	}, [apiKey, uniqueAddresses.join(",")]);

	if (!apiKey) {
		return (
			<div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
				Set NEXT_PUBLIC_HELIUS_API_KEY to enable real-time events.
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Real-time Events</h2>
				<span className={`text-xs ${connected ? "text-green-600" : "text-neutral-500"}`}>
					{connected ? "Live" : "Disconnected"}
				</span>
			</div>
			{error && <div className="mb-3 rounded-md bg-red-500/10 p-2 text-xs text-red-600">{error}</div>}
			{uniqueAddresses.length === 0 ? (
				<p className="text-sm text-neutral-500">No addresses to subscribe.</p>
			) : events.length === 0 ? (
				<p className="text-sm text-neutral-500">Listening for activity…</p>
			) : (
				<ul className="space-y-2">
					{events.map((e, idx) => (
						<li key={idx} className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-800">
							<pre className="whitespace-pre-wrap break-words">{JSON.stringify(e, null, 2)}</pre>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}


