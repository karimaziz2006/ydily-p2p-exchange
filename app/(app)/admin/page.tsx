"use client";

import { useEffect, useMemo, useState } from "react";

type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Side = "buy" | "sell";

type TxStatus = "awaiting_release" | "accepted" | "denied";


type Tx = {
  id: string;
  createdAt: number;
  side: "buy" | "sell";
  coin: Coin;
  amountUsd: number;
  rate: number;
  receiveCoin: number;
  userId: string;
  vendor?: string;
  paymentMethod?: string;
  proofUrl?: string;
  status: TxStatus;
};



type Wallets = Record<string, Partial<Record<Coin, number>>>;

const WALLETS_KEY = "wallets_v1";

function fmt(n: number, max = 6) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(n);
}



function loadWallets(): Wallets {
  try {
    const raw = localStorage.getItem(WALLETS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Wallets) : {};
  } catch {
    return {};
  }
}

function saveWallets(w: Wallets) {
  localStorage.setItem(WALLETS_KEY, JSON.stringify(w));
}

export default function AdminPage() {
  const [items, setItems] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((data) => setItems(data.txs || []))
      .catch(() => setItems([]));
  }, []);


  const pendingCount = useMemo(() => items.filter((x) => x.status === "awaiting_release").length, [items]);

  function setStatus(id: string, status: Tx["status"]) {
    setItems((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status } : t));
      return next;
    });
  }

  function accept(id: string) {
    const tx = items.find((t) => t.id === id);
    if (!tx) return;

    // 1) mark accepted
    const nextRequests = items.map((t) => (t.id === id ? { ...t, status: "accepted" as TxStatus } : t));
    setItems(nextRequests);

    // 2) update wallet
    const wallets = loadWallets();
    const userWallet = wallets[tx.userId] ?? {};
    const coin = tx.coin as Coin;
    const prevBal = userWallet[coin] ?? 0;


    // buy -> add coin, sell -> subtract coin (simple demo rule)
    const delta = tx.side === "buy" ? tx.receiveCoin : -tx.receiveCoin;
    const newBal = Number((prevBal + delta).toFixed(8));

    wallets[tx.userId] = { ...userWallet, [coin]: newBal };
    saveWallets(wallets);

    alert(`Accepted. Wallet updated for ${tx.userId}: ${tx.coin} = ${fmt(newBal, 8)}`);
  }

  function deny(id: string) {
    setStatus(id, "denied");
    alert("Denied.");
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="mb-2 text-2xl font-semibold">Admin</div>
      <div className="text-sm text-white/60">Requests inbox</div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Requests</div>
          <div className="text-xs text-white/60">{pendingCount} awaiting_release</div>
        </div>

        {items.length === 0 ? (
          <div className="mt-3 text-sm text-white/70">No requests yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {t.side === "buy" ? "Buy" : "Sell"} {t.coin} — {fmt(t.receiveCoin, 6)} {t.coin}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      User: <span className="font-semibold">{t.userId}</span>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Vendor: <span className="font-semibold">{t.vendor ?? "-"}</span>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Payment: <span className="font-semibold">{t.paymentMethod ?? "-"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${
                        t.status === "awaiting_release"
                          ? "border-white/10 bg-white/5 text-white/70"
                          : t.status === "accepted"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                      }`}
                    >
                      {t.status}
                    </div>
                  </div>
                </div>

                {t.status === "awaiting_release" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => deny(t.id)}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => accept(t.id)}
                      className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-white/50">
        Tip: go to <span className="font-semibold">/admin</span> to review requests.
      </div>
    </div>
  );
}
