import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

// Helper function to check if a token is an NFT (has supply of 1 and decimals of 0)
function isNFT(mintInfo: any, tokenAmount: any): boolean {
	return tokenAmount.amount === "1" && mintInfo.decimals === 0;
}

export async function POST(request: Request) {
	try {
		const { address } = await request.json();
		if (!address || typeof address !== "string") {
			return NextResponse.json({ error: "Missing address" }, { status: 400 });
		}

		// Get RPC endpoint from environment or use default (devnet)
		const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
		const connection = new Connection(rpcUrl, "confirmed");

		let publicKey: PublicKey;
		try {
			publicKey = new PublicKey(address);
		} catch (e) {
			return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 });
		}

		// Get SOL balance
		const solBalance = await connection.getBalance(publicKey);
		const balanceSol = solBalance / 1e9; // Convert lamports to SOL

		// Get all token accounts
		const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
			programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
		});

		// Get current SOL price from CoinGecko
		let solPriceUsd = 150; // Default fallback
		try {
			const priceResponse = await fetch(
				"https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
				{ next: { revalidate: 60 } } // Cache for 60 seconds
			);
			if (priceResponse.ok) {
				const priceData = await priceResponse.json();
				solPriceUsd = priceData.solana?.usd || 150;
			}
		} catch (e) {
			console.error("Failed to fetch SOL price:", e);
		}
		const totalUsd = balanceSol * solPriceUsd;

		// Count tokens and NFTs
		let tokenCount = 0;
		let nftCount = 0;

		// Process each token account
		for (const accountInfo of tokenAccounts.value) {
			const parsedInfo = accountInfo.account.data.parsed.info;
			const tokenAmount = parsedInfo.tokenAmount;

			// Skip if balance is 0
			if (tokenAmount.uiAmount === 0) continue;

			tokenCount++;

			// Try to get mint info to check if it's an NFT
			try {
				const mintPublicKey = new PublicKey(parsedInfo.mint);
				const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);

				if (mintInfo.value && "parsed" in mintInfo.value.data) {
					const mintData = mintInfo.value.data.parsed.info;
					if (isNFT(mintData, tokenAmount)) {
						nftCount++;
						tokenCount--; // NFTs are not counted as tokens
					}
				}
			} catch (e) {
				// If we can't fetch mint info, skip NFT detection for this token
			}
		}

		return NextResponse.json({
			ok: true,
			data: {
				balanceSol,
				totalUsd,
				tokenCount,
				nftCount,
				lastUpdatedMs: Date.now(),
			},
		});
	} catch (e: any) {
		console.error("Sync error:", e);
		return NextResponse.json(
			{ error: e.message || "Failed to sync wallet data" },
			{ status: 500 }
		);
	}
}


