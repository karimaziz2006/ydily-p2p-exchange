import { NextResponse } from "next/server";

type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Side = "buy" | "sell";

type Tx = {
  id: string;
  createdAt: number;
  side: Side;
  coin: Coin;
  amountUsd: number;
  rate: number;
  feePct: number; // 0.02
  grossCoin: number;
  feeCoin: number;
  receiveCoin: number;
  status: "awaiting_release";
  vendor: string;
  proofProvided: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __DEMO_TXS__: Tx[] | undefined;
}
const store = () => (global.__DEMO_TXS__ ??= []);

function round(n: number, d = 2) {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
}

export async function GET() {
  const txs = store().slice().sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ txs, unreadCount: txs.length });
}

export async function POST(req: Request) {
  const form = await req.formData();

  const sideRaw = String(form.get("side") || "buy");
  const coinRaw = String(form.get("coin") || "USDT");
  const vendor = String(form.get("vendor") || "Unknown");
  const rate = Number(form.get("rate") || 1);
  const amountUsd = Number(form.get("amountUsd") || 0);

  const side: Side = sideRaw === "sell" ? "sell" : "buy";

  const allowedCoins: Coin[] = ["BTC", "ETH", "LTC", "SOL", "USDT"];
  const coin: Coin = allowedCoins.includes(coinRaw as Coin) ? (coinRaw as Coin) : "USDT";

  const proofFile = form.get("proof");
  const proofProvided = proofFile instanceof File && proofFile.size > 0;

  const feePct = 0.02;

  const grossCoin = amountUsd / rate;
  const feeCoin = grossCoin * feePct;
  const receiveCoin = grossCoin - feeCoin;

  const tx: Tx = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
    createdAt: Date.now(),
    side,
    coin,
    amountUsd: round(amountUsd, 2),
    rate: round(rate, 6),
    feePct,
    grossCoin: round(grossCoin, 6),
    feeCoin: round(feeCoin, 6),
    receiveCoin: round(receiveCoin, 6),
    status: "awaiting_release",
    vendor,
    proofProvided,
  };

  store().unshift(tx);

  return NextResponse.json({ ok: true, tx, unreadCount: store().length });
}
