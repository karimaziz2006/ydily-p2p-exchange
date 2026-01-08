"use client";

import { useMemo, useState } from "react";

type Coin = "USDT" | "BTC" | "ETH" | "SOL" | "LTC";
type ProductType = "All Types" | "Flexible" | "Fixed" | "VIP";

function Card({
  title,
  value,
  accentClass,
  icon,
}: {
  title: string;
  value: string;
  accentClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-semibold ${accentClass}`}>{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-black">
            {o}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
        ▼
      </div>
    </div>
  );
}

export default function EarnPage() {
  const [coin, setCoin] = useState<string>("All Coins");
  const [type, setType] = useState<ProductType>("All Types");

  // demo numbers (you can later load from db)
  const stats = useMemo(
    () => ({
      principal: "0",
      active: "0",
      totalRewards: "0.00000000",
      yesterday: "0.00000000",
    }),
    []
  );

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-black via-black to-white/5 p-6">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#f59e0b]/20">
          <span className="text-3xl">🏆</span>
        </div>

        <h1 className="text-center text-4xl font-extrabold text-[#f59e0b]">
          Earn Center
        </h1>

        <p className="mx-auto mt-3 max-w-[320px] text-center text-white/60">
          Secure your crypto assets and earn rewards with our professional
          earning solutions
        </p>
      </div>

      {/* Stats */}
      <div className="mt-5 grid gap-4">
        <Card
          title="Total Principal"
          value={stats.principal}
          accentClass="text-emerald-400"
          icon={<span className="text-2xl">👛</span>}
        />
        <Card
          title="Active Positions"
          value={stats.active}
          accentClass="text-sky-400"
          icon={<span className="text-2xl">🎯</span>}
        />
        <Card
          title="Total Rewards"
          value={stats.totalRewards}
          accentClass="text-purple-400"
          icon={<span className="text-2xl">🎁</span>}
        />
        <Card
          title="Yesterday Rewards"
          value={stats.yesterday}
          accentClass="text-amber-400"
          icon={<span className="text-2xl">📈</span>}
        />
      </div>

      {/* Tabs row (visual only for now) */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="grid grid-cols-4 gap-3">
          <button className="rounded-xl bg-[#f59e0b] py-3 text-black">
            🛡️
          </button>
          <button className="rounded-xl bg-white/5 py-3 text-white/70">
            ⏱️
          </button>
          <button className="rounded-xl bg-white/5 py-3 text-white/70">
            🕘
          </button>
          <button className="rounded-xl bg-white/5 py-3 text-white/70">
            📊
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="mt-6">
        <h2 className="text-3xl font-extrabold text-white">Available Products</h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <SelectBox
            value={coin}
            onChange={setCoin}
            options={["All Coins", "USDT", "BTC", "ETH", "SOL", "LTC"]}
          />
          <SelectBox
            value={type}
            onChange={(v) => setType(v as ProductType)}
            options={["All Types", "Flexible", "Fixed", "VIP"]}
          />
        </div>

        {/* Placeholder area for products list */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
          Products list goes here (next step).
          <div className="mt-2 text-xs text-white/40">
            Filters: {coin} • {type}
          </div>
        </div>
      </div>
    </div>
  );
}
