"use client";
import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

type WalletContextProviderProps = {
	children: ReactNode;
	endpoint?: string;
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children, endpoint }) => {
	const rpcEndpoint = useMemo(() => {
		return (
			endpoint ||
			process.env.NEXT_PUBLIC_RPC_URL ||
			clusterApiUrl((process.env.NEXT_PUBLIC_SOLANA_NETWORK as any) || "devnet")
		);
	}, [endpoint]);

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({}),
			new LedgerWalletAdapter(),
		],
		[]
	);

	return (
		<ConnectionProvider endpoint={rpcEndpoint}>
			<WalletProvider wallets={wallets} autoConnect localStorageKey="solana_wallet_adapter">
				<WalletModalProvider>{children}</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default WalletContextProvider;


