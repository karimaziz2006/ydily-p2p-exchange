"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Side = "buy" | "sell";
type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Method = "All Methods" | "Bank Transfer" | "PayPal" | "Wise" | "Revolut";

type PriceMap = Record<Coin, { usd: number; change24h: number }>;

type Offer = {
  id: string;
  side: Side;
  coin: Coin;
  vendor: string;
  rateUsdPerCoin: number;
  availableCoin: number;
  methods: Method[];
  updatedAt: number;
};

type Tx = {
  id: string;
  createdAt: number;
  side: Side;
  coin: Coin;
  amountUsd: number;
  rate: number;
  grossCoin: number;
  feeCoin: number;
  receiveCoin: number;

  status: "pending" | "accepted" | "denied";
  userId: string;

  // SELL extras
  sellWalletAddress?: string; // user address (SELL)
  sellEscrowSeconds?: number; // starting countdown seconds
  sellReleased?: boolean; // user clicked Release

  // BUY extras (safe: no images stored)
  proofAttached?: boolean;
  userWalletAddress?: string;
  escrowSeconds?: number;
  buyReleased?: boolean;


  // extra info for your portfolio realism (Home ignores extra fields)
  vendor?: string;
  paymentMethod?: Exclude<Method, "All Methods">;
};

const STORAGE_KEY = "recent_activity_v1";
const REQUESTS_KEY = "requests_v1";
const WALLETS_KEY = "wallets_v1";
const USER_KEY = "current_user_id_v1";

type Wallets = Record<string, Partial<Record<Coin, number>>>;

function getUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = `u_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

function loadRequests(): Tx[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRequests(items: Tx[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(items));
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmt(n: number, max = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(n);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function profitMultiplier(minPct: number, maxPct: number) {
  return 1 + randInt(minPct, maxPct) / 100;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeVendor() {
  const first = ["Marie", "Moussa", "Viktor", "Amina", "Sofia", "Yanis", "Hugo", "Lina", "Samir", "Nora"];
  const last = ["Dubois", "Keita", "Petrov", "Benali", "Martin", "Diallo", "Rossi", "Haddad", "Costa", "Nguyen"];
  return `${pick(first)} ${pick(last)} ${randInt(10, 99)}`;
}

function loadActivity(): Tx[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 20);
  } catch {
    return [];
  }
}

function saveActivity(items: Tx[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

function coinIcon(coin: Coin) {
  const map: Record<Coin, string> = {
    BTC: "₿",
    ETH: "Ξ",
    LTC: "Ł",
    SOL: "◎",
    USDT: "$",
  };
  return map[coin];
}

function loadWallets(): Wallets {
  try {
    const raw = localStorage.getItem(WALLETS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function saveWallets(wallets: Wallets) {
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
}

function updateWalletBalance(userId: string, coin: Coin, delta: number) {
  const wallets = loadWallets();
  const userWallet = wallets[userId] ?? {};
  const current = Number(userWallet[coin] ?? 0);
  const next = Math.max(0, current + delta);

  wallets[userId] = { ...userWallet, [coin]: next };
  saveWallets(wallets);
}

function getWalletBalance(userId: string, coin: Coin) {
  const wallets = loadWallets();
  return Number(wallets?.[userId]?.[coin] ?? 0);
}

export default function P2PPage() {
  const [side, setSide] = useState<Side>("buy");
  const [coin, setCoin] = useState<Coin>("USDT");
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [method, setMethod] = useState<Method>("All Methods");
  const [vendorQuery, setVendorQuery] = useState("");

  const [prices, setPrices] = useState<PriceMap | null>(null);
  const pricesRef = useRef<PriceMap | null>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // modal steps
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<Exclude<Method, "All Methods">>("Bank Transfer");

  // BUY proof UI only (we do NOT store the image in localStorage to avoid quota)
  const [proofAttached, setProofAttached] = useState(false);

  // SELL: user address + escrow screen
  const [userAddress, setUserAddress] = useState("");
  const [showEscrow, setShowEscrow] = useState(false);
  const [sellEscrowSeconds, setEscrowSeconds] = useState(30 * 60); // 30:00
  const [escrowTxId, setEscrowTxId] = useState<string | null>(null);
  const escrowTimer = useRef<number | null>(null);

  const refreshTimer = useRef<number | null>(null);
  const priceTimer = useRef<number | null>(null);

  const MIN_USD = 10;
  const FEE_RATE = 0.02;
  const ESCROW_TOTAL = 30 * 60;

  async function fetchPrices() {
    try {
      const r = await fetch("/api/prices", { cache: "no-store" });
      const data = await r.json();
      setPrices(data);
    } catch {
      // ignore
    }
  }

  const userId = typeof window !== "undefined" ? getUserId() : "temp";
  const walletBalance = typeof window !== "undefined" ? getWalletBalance(userId, coin) : 0;

  // your SELL input uses amountUsd as "coin amount"
  const sellTooMuch = side === "sell" && amountUsd > walletBalance;

  function generateOffers(currentPrices: PriceMap | null) {
    const base: PriceMap =
      currentPrices ?? {
        BTC: { usd: 90000, change24h: 0 },
        ETH: { usd: 3000, change24h: 0 },
        LTC: { usd: 80, change24h: 0 },
        SOL: { usd: 140, change24h: 0 },
        USDT: { usd: 1, change24h: 0 },
      };

    const coins: Coin[] = ["BTC", "ETH", "LTC", "SOL", "USDT"];
    const newOffers: Offer[] = [];

    for (const c of coins) {
      for (let i = 0; i < 8; i++) {
        const isBuy = Math.random() > 0.5;
        const oSide: Side = isBuy ? "buy" : "sell";

        let rate: number;

        if (oSide === "buy") {
          // BUY → normal / slightly cheaper than market (0–2% discount)
          const discount = randInt(0, 2) / 100;
          rate = base[c].usd * (1 - discount);
        } else {
          // SELL → PROFITABLE (15–20% higher)
          const profit = profitMultiplier(15, 20);
          rate = base[c].usd * profit;
        }


        const availableCoin =
          c === "BTC"
            ? randInt(1, 30) / 100
            : c === "ETH"
              ? randInt(5, 120) / 10
              : c === "USDT"
                ? randInt(500, 8000)
                : c === "SOL"
                  ? randInt(50, 2000) / 10
                  : randInt(50, 5000) / 10;

        newOffers.push({
          id: `${oSide}-${c}-${Date.now()}-${i}-${randInt(1000, 9999)}`,
          side: oSide,
          coin: c,
          vendor: makeVendor(),
          rateUsdPerCoin: Number(rate.toFixed(2)),
          availableCoin: Number(availableCoin.toFixed(4)),
          methods: ["All Methods"],
          updatedAt: Date.now(),
        });
      }
    }

    setOffers(shuffle(newOffers));
  }

  useEffect(() => {
    fetchPrices();
    generateOffers(null);

    priceTimer.current = window.setInterval(() => {
      fetchPrices();
    }, 20000);

    refreshTimer.current = window.setInterval(() => {
      generateOffers(pricesRef.current);
    }, 20000);

    return () => {
      if (refreshTimer.current) window.clearInterval(refreshTimer.current);
      if (priceTimer.current) window.clearInterval(priceTimer.current);
      if (escrowTimer.current) window.clearInterval(escrowTimer.current);
    };
  }, []);

  useEffect(() => {
    pricesRef.current = prices;
    if (!prices) return;
    generateOffers(prices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  const filteredOffers = useMemo(() => {
    const q = vendorQuery.trim().toLowerCase();

    return offers
      .filter((o) => o.side === side)
      .filter((o) => o.coin === coin)
      .filter(() => {
        // if method != All Methods -> show none (your rule)
        if (method !== "All Methods") return false;
        return true;
      })
      .filter((o) => (q ? o.vendor.toLowerCase().includes(q) : true))
      .slice(0, 20);
  }, [offers, side, coin, method, vendorQuery]);

  const topPrices = useMemo(() => {
    const p = prices;
    const coins: Coin[] = ["BTC", "ETH", "LTC", "SOL", "USDT"];
    return coins.map((c) => ({
      coin: c,
      usd: p?.[c]?.usd ?? (c === "USDT" ? 1 : 0),
      change24h: p?.[c]?.change24h ?? 0,
    }));
  }, [prices]);

  function calcSummary(offer: Offer, amount: number, side: Side) {
    if (side === "buy") {
      // User pays USD -> receives coin
      const grossCoin = amount / offer.rateUsdPerCoin;
      const feeCoin = grossCoin * FEE_RATE;
      const receiveCoin = grossCoin - feeCoin;
      return { mode: "buy" as const, grossCoin, feeCoin, receiveCoin };
    }

    // SELL:
    // User sells COIN -> receives USD
    const grossUsd = amount * offer.rateUsdPerCoin;
    const feeUsd = grossUsd * FEE_RATE;
    const receiveUsd = grossUsd - feeUsd;
    return { mode: "sell" as const, grossUsd, feeUsd, receiveUsd };
  }


  function resetEscrow() {
    setShowEscrow(false);
    setEscrowTxId(null);
    setEscrowSeconds(ESCROW_TOTAL);
    if (escrowTimer.current) window.clearInterval(escrowTimer.current);
    escrowTimer.current = null;
  }

  function openStep1(offer: Offer) {
    setSelectedOffer(offer);
    setModalStep(1);
    setPaymentMethod("Bank Transfer");

    // reset BUY proof UI state
    setProofAttached(false);

    // reset SELL states
    setUserAddress("");
    resetEscrow();
  }

  function goToPaymentStep() {
    if (amountUsd < MIN_USD) return;
    setModalStep(2);
  }

  function startEscrow(txId: string) {
    setEscrowTxId(txId);
    setShowEscrow(true);
    setEscrowSeconds(ESCROW_TOTAL);

    if (escrowTimer.current) window.clearInterval(escrowTimer.current);
    escrowTimer.current = window.setInterval(() => {
      setEscrowSeconds((s) => Math.max(0, s - 1));
    }, 1000);
  }

  function submitRequest() {
    if (!selectedOffer) return;
    if (amountUsd < MIN_USD) return;

    const uid = getUserId();

    // 1) SELL: require address BEFORE anything
    if (side === "sell" && !userAddress.trim()) {
      alert("Please enter your USDT (TRC20) address.");
      return;
    }

    // 2) Calculate summary once
    const s = calcSummary(selectedOffer, amountUsd, side);

    // 3) SELL: check balance BEFORE wallet update
    if (side === "sell") {
      const bal = getWalletBalance(uid, coin); // balance BEFORE subtract
      if (amountUsd > bal) {
        alert(`Insufficient balance. You have ${fmt(bal, 6)} ${coin}.`);
        return;
      }
    }

    // 4) NOW update wallet (safe)
    if (side === "sell") {
      updateWalletBalance(uid, coin, -(amountUsd ?? 0));
     // user gives coin
    } else {
      updateWalletBalance(uid, coin, s.receiveCoin ?? 0);  // user receives coin
    }

    // 5) Create tx object (keep your existing logic)
    const id = `tx_${Date.now()}_${randInt(1000, 9999)}`;

    const tx: Tx = {
      id,
      createdAt: Date.now(),
      userId: uid,
      side,
      coin,
      amountUsd,
      rate: selectedOffer.rateUsdPerCoin,

      // Only valid for BUY mode (SELL doesn't use these)
      grossCoin: s.mode === "buy" ? s.grossCoin : 0,
      feeCoin: s.mode === "buy" ? s.feeCoin : 0,
      receiveCoin: s.mode === "buy" ? s.receiveCoin : 0,

      status: "pending",
      vendor: selectedOffer.vendor,
      paymentMethod,

      proofAttached: side === "buy" ? Boolean(proofAttached) : undefined,
      sellWalletAddress: side === "sell" ? userAddress.trim() : undefined,
      sellEscrowSeconds: side === "sell" ? ESCROW_TOTAL : undefined,
      sellReleased: side === "sell" ? false : undefined,
    };

    const existingReq = loadRequests();
    saveRequests([tx, ...existingReq]);

    const existing = loadActivity();
    saveActivity([tx, ...existing]);

    if (side === "sell") {
      startEscrow(id);
      alert("Sell request created. Escrow started.");
      return;
    }

    alert("Buy request created. Check Admin.");
    setSelectedOffer(null);
    setModalStep(1);
    setProofAttached(false);
    setUserAddress("");
    resetEscrow();
  }



  function closeModal() {
    setSelectedOffer(null);
    setModalStep(1);
    setProofAttached(false);
    setUserAddress("");
    resetEscrow();
  }

  const amountTooLow = amountUsd < MIN_USD;

  const escrowMM = String(Math.floor(sellEscrowSeconds / 60)).padStart(2, "0");
  const escrowSS = String(sellEscrowSeconds % 60).padStart(2, "0");
  const escrowPct = Math.min(100, Math.max(0, ((ESCROW_TOTAL - sellEscrowSeconds) / ESCROW_TOTAL) * 100));

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4">
      {/* top strip prices */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Market</div>
          <button
            onClick={() => {
              fetchPrices();
              generateOffers(pricesRef.current);
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2 text-center">
          {topPrices.map((p) => (
            <div key={p.coin} className="rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="text-xs text-white/70">{p.coin}</div>
              <div className="text-sm font-semibold">{p.coin === "USDT" ? "$1.00" : money(p.usd).replace(".00", "")}</div>
              <div className={`text-[11px] ${p.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {p.change24h >= 0 ? "+" : ""}
                {fmt(p.change24h, 2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buy/Sell + Refresh Vendors */}
      <div className="mb-4 flex gap-2">
        <div className="flex flex-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setSide("buy")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm ${side === "buy" ? "bg-white/10 text-white" : "text-white/70"}`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm ${side === "sell" ? "bg-white/10 text-white" : "text-white/70"}`}
          >
            Sell
          </button>
        </div>

        <button
          onClick={() => generateOffers(pricesRef.current)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
        >
          Refresh Vendors
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 text-lg font-semibold">
          {side === "buy" ? "Buy" : "Sell"} {coin}
        </div>

        <label className="block text-xs text-white/60">Cryptocurrency</label>
        <select
          value={coin}
          onChange={(e) => setCoin(e.target.value as Coin)}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
        >
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="LTC">LTC</option>
          <option value="SOL">SOL</option>
          <option value="USDT">USDT</option>
        </select>

        <label className="mt-4 block text-xs text-white/60">Amount (USD)</label>
        <input
          type="number"
          value={Number.isFinite(amountUsd) ? amountUsd : MIN_USD}
          onChange={(e) => setAmountUsd(Number(e.target.value) || 0)}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
          min={MIN_USD}
          step="0.01"
        />

        {amountTooLow && (
          <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
            Amount is below minimum. Please enter at least {money(MIN_USD)}.
          </div>
        )}

        <label className="mt-4 block text-xs text-white/60">Payment Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
        >
          <option>All Methods</option>
          <option>Bank Transfer</option>
          <option>PayPal</option>
          <option>Wise</option>
          <option>Revolut</option>
        </select>

        <label className="mt-4 block text-xs text-white/60">Search vendor</label>
        <input
          value={vendorQuery}
          onChange={(e) => setVendorQuery(e.target.value)}
          placeholder="Search vendor..."
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
        />

        <div className="mt-3 text-xs text-white/60">Offers refresh automatically every 20 seconds</div>
      </div>

      {/* Offers */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold">
          {side === "buy" ? "Buy" : "Sell"} {coin} Offers
        </div>

        {filteredOffers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No offers available for this filter.</div>
        ) : (
          <div className="space-y-3">
            {filteredOffers.map((o) => (
              <button
                key={o.id}
                onClick={() => openStep1(o)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{o.vendor}</div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70">
                    {coinIcon(o.coin)} {o.coin}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-white/60">Rate</div>
                    <div className="font-semibold">
                      {money(o.rateUsdPerCoin)} <span className="text-white/60 text-xs">per {o.coin}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Available</div>
                    <div className="font-semibold">
                      {fmt(o.availableCoin, 4)} {o.coin}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-white/60">Payment: {o.methods.join(", ")}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                {side === "buy" ? "Buy" : "Sell"} {selectedOffer.coin}
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
              >
                ✕
              </button>
            </div>

            <div className="mt-1 text-sm text-white/60">Trade with {selectedOffer.vendor}</div>

            {/* SELL Escrow screen */}
            {showEscrow && side === "sell" && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold text-center">Escrow Verification</div>
                <div className="mt-1 text-xs text-white/60 text-center">
                  TX #{escrowTxId ? escrowTxId.slice(-4) : "----"} • USDT Network
                </div>

                <div className="mt-4 text-center text-4xl font-semibold">
                  {escrowMM}:{escrowSS}
                </div>

                <div className="mt-3 text-xs text-white/60 text-center">Verification Window Active</div>

                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${escrowPct}%` }} />
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => {
                      closeModal();
                    }}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => {
                      const ok = confirm("Release escrow now? This will send the request to admin for approval.");
                      if (!ok) return;

                      const reqs = loadRequests();
                      const updated = reqs.map((r) => (r.id === escrowTxId ? { ...r, released: true } : r));
                      saveRequests(updated);

                      alert("Released. Admin will review.");
                    }}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Release
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {!showEscrow && modalStep === 1 && (
              <>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold">Amount</div>

                  <div className="mt-3">
                    <label className="block text-xs text-white/60">
                      {side === "sell" ? `Amount (${selectedOffer.coin})` : "Amount (USD)"}
                    </label>
                    <input
                      type="number"
                      value={Number.isFinite(amountUsd) ? amountUsd : MIN_USD}
                      onChange={(e) => setAmountUsd(Number(e.target.value) || 0)}
                      min={MIN_USD}
                      step="0.01"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
                    />
                    {amountTooLow && (
                      <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
                        Amount is below minimum. Please enter at least {money(MIN_USD)}.
                      </div>
                    )}
                    {sellTooMuch && (
                      <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200">
                        Insufficient balance. You have {fmt(walletBalance, 6)} {coin}.
                      </div>
                    )}

                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold">Transaction Breakdown</div>

                  {(() => {
                    const s = calcSummary(selectedOffer, amountUsd, side);

                    return (
                      <div className="mt-3 space-y-2 text-sm">
                        {s.mode === "buy" ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-white/70">Amount (USD)</span>
                              <span className="font-semibold">{money(amountUsd)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">Rate</span>
                              <span className="font-semibold">
                                {money(selectedOffer.rateUsdPerCoin)} / {selectedOffer.coin}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">Gross</span>
                              <span className="font-semibold">
                                {fmt(s.grossCoin, 6)} {selectedOffer.coin}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">P2P Fee (2%)</span>
                              <span className="font-semibold text-rose-300">
                                -{fmt(s.feeCoin, 6)} {selectedOffer.coin}
                              </span>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="flex justify-between text-base">
                              <span className="text-white/70">You receive</span>
                              <span className="font-semibold text-emerald-300">
                                {fmt(s.receiveCoin, 6)} {selectedOffer.coin}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-white/70">Amount ({selectedOffer.coin})</span>
                              <span className="font-semibold">
                                {fmt(amountUsd, 6)} {selectedOffer.coin}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">Rate</span>
                              <span className="font-semibold">
                                {money(selectedOffer.rateUsdPerCoin)} / {selectedOffer.coin}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">Gross</span>
                              <span className="font-semibold">{money(s.grossUsd)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-white/70">P2P Fee (2%)</span>
                              <span className="font-semibold text-rose-300">-{money(s.feeUsd)}</span>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="flex justify-between text-base">
                              <span className="text-white/70">You receive</span>
                              <span className="font-semibold text-emerald-300">{money(s.receiveUsd)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={closeModal} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    Cancel
                  </button>

                  <button
                    disabled={amountTooLow || sellTooMuch}
                    onClick={goToPaymentStep}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      amountTooLow || sellTooMuch
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    Continue
                  </button>

                </div>
              </>
            )}

            {/* STEP 2 */}
            {!showEscrow && modalStep === 2 && (
              <>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold">Payment Method</div>

                  {/* BUY vs SELL */}
                  {side === "buy" ? (
                    <>
                      <div className="mt-3 space-y-2 text-sm">
                        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                          <span>USDT (TRC20)</span>
                          <input
                            type="radio"
                            name="pmethod"
                            checked={paymentMethod === "Bank Transfer"}
                            onChange={() => setPaymentMethod("Bank Transfer")}
                          />
                        </label>

                        {paymentMethod === "Bank Transfer" && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/60">USDT TRC20 Address</div>
                            <div className="mt-1 break-all text-sm font-semibold">TRT7Ug5RJTWwUNj75zAtksfJbubbzbUWNP</div>

                            <button
                              onClick={() => navigator.clipboard.writeText("TRT7Ug5RJTWwUNj75zAtksfJbubbzbUWNP")}
                              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                            >
                              Copy Address
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 text-xs text-white/60">Upload proof (screenshot/receipt)</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setProofAttached(!!file);
                        }}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm"
                      />

                      {proofAttached && <div className="mt-2 text-xs text-white/70">Proof attached</div>}
                    </>
                  ) : (
                    <>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="text-sm font-semibold">Your USDT (TRC20) Address</div>
                        <div className="mt-2 text-xs text-white/60">This is where you want to receive the USDT.</div>

                        <input
                          value={userAddress}
                          onChange={(e) => setUserAddress(e.target.value)}
                          placeholder="Paste your TRC20 address..."
                          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm"
                        />

                        <div className="mt-2 text-xs text-white/60">Make sure it’s TRC20. Wrong address = lost funds.</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setModalStep(1)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    Back
                  </button>

                  <button onClick={submitRequest} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
