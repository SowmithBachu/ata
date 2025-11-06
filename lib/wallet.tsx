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
    // Force devnet endpoint for consistency with API airdrop (no env checks)
    const rpcEndpoint = useMemo(() => {
        if (endpoint) return endpoint;
        return clusterApiUrl("devnet");
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


