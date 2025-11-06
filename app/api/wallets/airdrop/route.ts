import { NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function POST(request: Request) {
	try {
		const { address, amount = 2 } = await request.json();
		if (!address || typeof address !== "string") {
			return NextResponse.json({ error: "Missing address" }, { status: 400 });
		}
        const rpcCandidates: string[] = [
            "https://api.devnet.solana.com",
            "https://rpc.ankr.com/solana_devnet"
        ];

		let publicKey: PublicKey;
		try {
			publicKey = new PublicKey(address);
		} catch (e) {
			return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 });
		}

        // Iterate across RPCs and decreasing amounts with small backoff
        const tryAmounts = [amount, 1, 0.5, 0.2, 0.1];
        let signature: string | null = null;
        let lastErr: any = null;
        for (const rpcUrl of rpcCandidates) {
            const connection = new Connection(rpcUrl, "confirmed");
            for (const amt of tryAmounts) {
                try {
                    const lamports = Math.floor(Math.max(0.1, amt) * LAMPORTS_PER_SOL);
                    signature = await connection.requestAirdrop(publicKey, lamports);
                    // Confirm using latest blockhash
                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
                    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
                    // Success
                    lastErr = null;
                    break;
                } catch (e: any) {
                    lastErr = e;
                    const msg = String(e?.message || e);
                    // On explicit 429 from faucet, try next RPC immediately
                    if (msg.includes("429") || msg.toLowerCase().includes("too many requests")) {
                        break; // break inner loop, move to next RPC
                    }
                    // brief backoff before next attempt on same RPC
                    await new Promise((r) => setTimeout(r, 300));
                }
            }
            if (signature) break; // stop if we already succeeded
        }
        if (!signature) {
            const raw = String(lastErr?.message || lastErr || "Airdrop failed");
            const is429 = raw.includes("429") || raw.toLowerCase().includes("too many requests");
            const payload: any = { ok: false, error: is429 ? "Airdrop rate-limited. Please use the faucet." : raw };
            if (is429) payload.code = 429;
            return NextResponse.json(payload, { status: is429 ? 429 : 500, headers: { "Cache-Control": "no-store" } });
        }

		// Get updated balance
        // Use the first working RPC (signature confirmed above) to fetch balance
        const finalConnection = new Connection(rpcCandidates[0], "confirmed");
        const balance = await finalConnection.getBalance(publicKey);
		const balanceSol = balance / LAMPORTS_PER_SOL;

        return NextResponse.json({
			ok: true,
			data: {
				signature,
				balanceSol,
                airdroppedAmount: amount,
			},
        }, { headers: { "Cache-Control": "no-store" } });
	} catch (e: any) {
		console.error("Airdrop error:", e);
        const message = typeof e?.message === "string" ? e.message : "Failed to airdrop SOL";
        return NextResponse.json({ ok: false, error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
	}
}
