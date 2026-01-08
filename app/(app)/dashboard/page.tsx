"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Side = "buy" | "sell";

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
};

type Wallets = Record<string, Partial<Record<Coin, number>>>;

const USER_KEY = "current_user_id_v1";
const REQUESTS_KEY = "requests_v1";
const WALLETS_KEY = "wallets_v1";

function fmt(n: number, max = 6) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(n);
}

function safeGetUserId() {
  if (typeof window === "undefined") return "";
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
    return Array.isArray(parsed) ? (parsed as Tx[]) : [];
  } catch {
    return [];
  }
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

export default function DashboardPage() {
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState<Tx[]>([]);
  const [wallets, setWallets] = useState<Wallets>({});

  const reload = () => {
    setRequests(loadRequests());
    setWallets(loadWallets());
  };

  useEffect(() => {
    setUserId(safeGetUserId());
    reload();

    const onStorage = (e: StorageEvent) => {
      if (e.key === REQUESTS_KEY || e.key === WALLETS_KEY) reload();
    };
    window.addEventListener("storage", onStorage);

    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const myWallet = useMemo(() => wallets[userId] ?? {}, [wallets, userId]);
  const myUSDT = myWallet.USDT ?? 0;

  const myRecent = useMemo(() => {
    return requests
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [requests, userId]);

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="mb-2 text-2xl font-semibold">Dashboard</div>
      <div className="text-sm text-white/60 break-all">User: {userId || "-"}</div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">Balance (USDT)</div>
        <div className="mt-1 text-3xl font-semibold">{fmt(myUSDT, 6)} USDT</div>
        <div className="mt-3">
          <Link className="text-sm underline text-white/80" href="/wallet">
            Open Wallet
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Recent Activity</div>
          <div className="text-xs text-white/60">{myRecent.length} items</div>
        </div>

        {myRecent.length === 0 ? (
          <div className="mt-3 text-sm text-white/70">
            No activity yet. Go to{" "}
            <Link href="/p2p" className="font-semibold underline">
              P2P
            </Link>{" "}
            and submit a request.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {myRecent.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {t.side === "buy" ? "Buy" : "Sell"} {t.coin}
                    </div>
                    <div className="text-xs text-white/60">P2P Order</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-300">
                      {t.side === "buy" ? "+" : "-"}
                      {fmt(t.side === "buy" ? t.receiveCoin : t.amountUsd, 6)} {t.coin}
                    </div>


                    <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                      {t.status === "pending"
                        ? "Pending review"
                        : t.status === "accepted"
                          ? "Accepted"
                          : "Denied"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
