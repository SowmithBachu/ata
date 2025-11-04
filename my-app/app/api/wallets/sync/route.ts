import { NextResponse } from "next/server";

// POST /api/wallets/sync - accept address and return ack for now
export async function POST(request: Request) {
	try {
		const { address } = await request.json();
		if (!address || typeof address !== "string") {
			return NextResponse.json({ error: "Missing address" }, { status: 400 });
		}
		// Placeholder: enqueue sync job / trigger data sync here
		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (e) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}


