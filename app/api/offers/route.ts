import { NextResponse } from "next/server";

type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Side = "buy" | "sell";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function round(n: number, d = 2) {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
}

function makeVendorName() {
  const first = ["Marie", "Moussa", "Viktor", "Sara", "Lina", "Amine", "Yanis", "Noah", "Hana", "Omar"];
  const last = ["Dubois", "Keita", "Petrov", "Benali", "Khan", "Silva", "Rossi", "Chen", "Diallo", "Ibrahim"];
  const suffix = Math.random() < 0.5 ? "" : ` ${Math.floor(rand(10, 99))}`;
  return `${pick(first)} ${pick(last)}${suffix}`;
}

function allowedDemoMethodsForCoin(coin: Coin): string[] {
  if (coin === "USDT") return ["USDT TRC20"];
  if (coin === "BTC") return ["BTC", "USDT TRC20"];
  if (coin === "ETH") return ["ETH", "USDT TRC20"];
  if (coin === "LTC") return ["LTC", "USDT TRC20"];
  if (coin === "SOL") return ["SOL", "USDT TRC20"];
  return ["USDT TRC20"];
}

function baseRateForCoin(coin: Coin) {
  if (coin === "USDT") return 1.0;
  if (coin === "BTC") return 95000;
  if (coin === "ETH") return 3200;
  if (coin === "LTC") return 85;
  if (coin === "SOL") return 140;
  return 1;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const side = (searchParams.get("side") || "buy") as Side; // buy OR sell
  const coin = (searchParams.get("coin") || "USDT") as Coin;
  const amountStr = searchParams.get("amount") || "0";
  const payment = (searchParams.get("payment") || "ALL").toUpperCase();

  const amount = Number(amountStr);
  const minTradeUsd = 10;

  if (payment !== "ALL") {
    return NextResponse.json({ offers: [], reason: "payment_filter_blocks_offers" });
  }

  const count = Math.floor(rand(6, 12));
  const base = baseRateForCoin(coin);

  // ✅ applies to BOTH buy and sell
  const MIN_DISCOUNT = 0.12; // 12%
  const MAX_DISCOUNT = 0.20; // 20%

  const offers = Array.from({ length: count }).map((_, i) => {
    const spread = coin === "USDT" ? rand(0.90, 1.05) : rand(0.98, 1.02);
    const rawRate = base * spread;

    const discount = rand(MIN_DISCOUNT, MAX_DISCOUNT);
    const rate = round(rawRate * (1 - discount), 2);

    const available =
      coin === "USDT" ? round(rand(200, 5000), 2) : round(rand(0.02, 3), 6);

    const vendor = makeVendorName();

    const maxUsd = Math.max(
      200,
      Math.min(15000, Math.floor(rand(500, 4000) * (amount > 0 ? 1 : 1)))
    );

    return {
      id: `${coin}-${side}-${Date.now()}-${i}-${Math.floor(rand(1000, 9999))}`,
      side,
      coin,
      vendor,
      rate,
      available,
      minUsd: minTradeUsd,
      maxUsd,
      allowedMethods: allowedDemoMethodsForCoin(coin),
      demo: true,
      discountPct: Math.round(discount * 100), // debug
    };
  });

  for (let i = offers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [offers[i], offers[j]] = [offers[j], offers[i]];
  }

  return NextResponse.json({ offers, updatedAt: Date.now() });
}
