"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Status = "All Statuses" | "Pending" | "Approved" | "Rejected" | "Completed";

function Button({
  children,
  variant = "ghost",
  className = "",
  href,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "w-full rounded-2xl px-4 py-4 font-semibold flex items-center justify-center gap-2 border transition";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-black border-emerald-500/40 hover:bg-emerald-500"
      : "bg-white/5 text-white border-white/10 hover:bg-white/10";

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-sm">
      {children}
    </div>
  );
}

export default function WithdrawPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("All Statuses");

  // demo: empty list (later we can wire DB)
  const withdrawals = useMemo(() => [], []);

  const filtered = useMemo(() => {
    // since empty, this stays empty; keeping structure for later
    return withdrawals;
  }, [withdrawals]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-black via-black to-white/5 p-6">
        <h1 className="text-3xl font-extrabold text-white">Withdrawal History</h1>
        <p className="mt-2 text-white/60">
          Track and manage your cryptocurrency withdrawals
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-3">
        <Button variant="primary" href="/withdraw/new">
          <span className="text-lg">↘</span>
          New Withdrawal
        </Button>

        <Button
          onClick={() => {
            alert("Export CSV (demo) — we’ll wire this later.");
          }}
        >
          <span className="text-lg">↓</span>
          Export CSV
        </Button>

        <Button
          onClick={() => {
            alert("Refresh (demo) — we’ll wire this later.");
          }}
        >
          <span className="text-lg">⟳</span>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-5">
        <Panel>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-white/50">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by hash or address..."
              className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
            />
          </div>

          <div className="mt-3">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
              >
                <option className="bg-black">All Statuses</option>
                <option className="bg-black">Pending</option>
                <option className="bg-black">Approved</option>
                <option className="bg-black">Rejected</option>
                <option className="bg-black">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/60">
                ▼
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-white/50">
              <span className="rounded-full bg-white/10 px-2 py-1">i</span>
              <span>{filtered.length} withdrawals found</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Empty state */}
      <div className="mt-5">
        <Panel>
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 text-5xl text-white/40">↘</div>
            <h2 className="text-2xl font-bold text-white">No Withdrawals Found</h2>
            <p className="mt-2 text-white/60">You haven't made any withdrawals yet</p>

            <div className="mt-6">
              <Button variant="primary" href="/withdraw/new" className="max-w-[320px] mx-auto">
                <span className="text-lg">↘</span>
                Make Your First Withdrawal
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
