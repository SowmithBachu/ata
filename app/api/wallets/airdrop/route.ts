import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function POST(request: Request) {
	try {
		const { address, amount = 2 } = await request.json();
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

		// Request airdrop (only works on devnet/testnet)
		const airdropAmount = amount * LAMPORTS_PER_SOL;
		const signature = await connection.requestAirdrop(publicKey, airdropAmount);

		// Wait for confirmation
		await connection.confirmTransaction(signature, "confirmed");

		// Get updated balance
		const balance = await connection.getBalance(publicKey);
		const balanceSol = balance / LAMPORTS_PER_SOL;

		return NextResponse.json({
			ok: true,
			data: {
				signature,
				balanceSol,
				airdroppedAmount: amount,
			},
		});
	} catch (e: any) {
		console.error("Airdrop error:", e);
		return NextResponse.json(
			{ error: e.message || "Failed to airdrop SOL" },
			{ status: 500 }
		);
	}
}
