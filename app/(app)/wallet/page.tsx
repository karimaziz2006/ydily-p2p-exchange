"use client";

import { useEffect, useMemo, useState } from "react";

type Coin = "BTC" | "ETH" | "LTC" | "SOL" | "USDT";
type Wallets = Record<string, Partial<Record<Coin, number>>>;

const WALLETS_KEY = "wallets_v1";
const USER_KEY = "current_user_id_v1";

function getUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = `u_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem(USER_KEY, id);
  }
  return id;
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

function fmt(n: number, max = 8) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: max }).format(n);
}

export default function WalletPage() {
  const [userId, setUserId] = useState<string>("");
  const [wallets, setWallets] = useState<Wallets>({});

  useEffect(() => {
    const load = () => {
      setUserId(getUserId());
      setWallets(loadWallets());
    };

    load();

    // updates ONLY when another tab changes localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === WALLETS_KEY) setWallets(loadWallets());
    };

    // updates when you leave admin and come back to this tab/page
    const onVisibility = () => {
      if (!document.hidden) setWallets(loadWallets());
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const balances = useMemo(() => {
    const w = wallets[userId] ?? {};
    const coins: Coin[] = ["USDT", "BTC", "ETH", "SOL", "LTC"];
    return coins.map((c) => ({ coin: c, amount: w[c] ?? 0 }));
  }, [wallets, userId]);

  const totalUSDT = useMemo(() => {
    const usdt = balances.find((b) => b.coin === "USDT")?.amount ?? 0;
    return usdt;
  }, [balances]);

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="mb-2 text-2xl font-semibold">Wallet</div>
      <div className="text-sm text-white/60 break-all">User: {userId || "-"}</div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">Total (USDT)</div>
        <div className="mt-1 text-3xl font-semibold">{fmt(totalUSDT, 6)} USDT</div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-semibold">Balances</div>

        <div className="mt-3 space-y-2">
          {balances.map((b) => (
            <div
              key={b.coin}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              <div className="text-sm font-semibold">{b.coin}</div>
              <div className="text-sm text-white/80">{fmt(b.amount, 8)}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setWallets(loadWallets())}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
