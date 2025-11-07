import { NextResponse } from "next/server";

export async function GET() {
	try {
		const response = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
			{
				next: { revalidate: 30 },
				headers: {
					"User-Agent": "BlockLens/1.0 (https://github.com/SowmithBachu/ata)",
				},
			}
		);

		if (!response.ok) {
			return NextResponse.json(
				{ ok: false, error: "Failed to fetch SOL price" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		const price = Number(data?.solana?.usd ?? 0);

		if (!Number.isFinite(price) || price <= 0) {
			return NextResponse.json(
				{ ok: false, error: "Invalid SOL price returned" },
				{ status: 502 }
			);
		}

		return NextResponse.json({ ok: true, price });
	} catch (error: any) {
		return NextResponse.json(
			{ ok: false, error: error?.message ?? "Unexpected error fetching SOL price" },
			{ status: 500 }
		);
	}
}

