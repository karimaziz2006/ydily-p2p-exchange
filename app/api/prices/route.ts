import { NextResponse } from "next/server";

export async function GET() {
  // CoinGecko simple price
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,solana,tether&vs_currencies=usd&include_24hr_change=true";

  const r = await fetch(url, { next: { revalidate: 10 } }); // cache a bit
  if (!r.ok) {
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }

  const data = await r.json();

  const prices = {
    BTC: { usd: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
    ETH: { usd: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
    LTC: { usd: data.litecoin.usd, change24h: data.litecoin.usd_24h_change },
    SOL: { usd: data.solana.usd, change24h: data.solana.usd_24h_change },
    USDT: { usd: data.tether.usd, change24h: data.tether.usd_24h_change },
  };

  return NextResponse.json(prices);
}
