import { NextResponse } from "next/server";

// GET /api/wallets - return a stub list for now
export async function GET() {
	// Replace with real DB fetch (e.g., Supabase)
	const wallets: Array<{
		id: string;
		name: string;
		address: string;
		totalUsd?: number;
		tokenCount?: number;
		nftCount?: number;
	}> = [];

	return NextResponse.json(wallets, { status: 200 });
}


