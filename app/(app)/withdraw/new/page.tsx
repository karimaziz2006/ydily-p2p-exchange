"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Coin = "USDT" | "BTC" | "ETH" | "SOL" | "LTC";
type Network =
  | "TRON (TRC20)"
  | "Ethereum (ERC20)"
  | "BSC (BEP20)"
  | "Solana"
  | "Bitcoin";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-semibold text-white/80">{children}</p>;
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-black">
            {o}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/60">
        ▼
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  right,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-white/40 outline-none"
      />
      {right ? (
        <div className="absolute inset-y-0 right-4 flex items-center text-white/60">
          {right}
        </div>
      ) : null}
    </div>
  );
}

export default function NewWithdrawalPage() {
  const [coin, setCoin] = useState<Coin>("USDT");
  const [network, setNetwork] = useState<Network>("TRON (TRC20)");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const available = useMemo(() => 0, []); // demo; later: pull from wallet
  const feeRate = 0.01; // 1% demo fee
  const parsedAmt = Number(amount || 0);
  const fee = isFinite(parsedAmt) ? parsedAmt * feeRate : 0;
  const receive = isFinite(parsedAmt) ? Math.max(parsedAmt - fee, 0) : 0;

  const [submitted, setSubmitted] = useState(false);

  const coinRequired = submitted && !coin;
  const netRequired = submitted && !network;
  const amountRequired = submitted && (!amount || parsedAmt <= 0);
  const addressRequired = submitted && address.trim().length < 10;

  return (
    <div className="pb-6">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-white/70 hover:text-white">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-b from-black via-black to-white/5 p-6">
        <div className="mb-3 text-3xl text-white/80">✈️</div>
        <h1 className="text-3xl font-extrabold text-white">
          Cryptocurrency Withdrawal
        </h1>
        <p className="mt-2 text-white/60">
          Send your crypto to external wallets securely
        </p>
      </div>

      {/* Steps (visual) */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white">
          👛
        </div>
        <div className="text-white/30">→</div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white/60">
          🧾
        </div>
        <div className="text-white/30">→</div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white/60">
          ✈️
        </div>
        <div className="text-white/30">→</div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white/60">
          🛡️
        </div>
      </div>

      {/* Form */}
      <div className="mt-5 space-y-4">
        <Panel>
          <h2 className="text-2xl font-extrabold text-white">Withdrawal Request</h2>

          <div className="mt-5 space-y-4">
            {/* Cryptocurrency */}
            <div>
              <FieldLabel>Cryptocurrency</FieldLabel>
              <Select
                value={coin}
                onChange={(v) => setCoin(v as Coin)}
                options={["USDT", "BTC", "ETH", "SOL", "LTC"]}
              />
              {coinRequired ? (
                <p className="mt-2 text-sm font-semibold text-red-400">
                  Cryptocurrency is required
                </p>
              ) : null}
            </div>

            {/* Network */}
            <div>
              <FieldLabel>Network</FieldLabel>
              <Select
                value={network}
                onChange={(v) => setNetwork(v as Network)}
                options={[
                  "TRON (TRC20)",
                  "Ethereum (ERC20)",
                  "BSC (BEP20)",
                  "Solana",
                  "Bitcoin",
                ]}
              />
              {netRequired ? (
                <p className="mt-2 text-sm font-semibold text-red-400">
                  Network is required
                </p>
              ) : null}
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Amount */}
            <div>
              <div className="flex items-end justify-between">
                <FieldLabel>Withdrawal Amount</FieldLabel>
                <div className="text-right text-sm text-white/50">
                  Available: {available.toFixed(6)} {coin}
                </div>
              </div>
              <Input
                value={amount}
                onChange={setAmount}
                placeholder="0.00"
                type="number"
                right={<span>{coin}</span>}
              />
              {amountRequired ? (
                <p className="mt-2 text-sm font-semibold text-red-400">
                  Amount is required
                </p>
              ) : null}
            </div>

            {/* Fee calc */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <span>🧾</span>
                  <span className="font-semibold">Fee Calculation</span>
                  <span className="ml-2 rounded-full bg-[#f59e0b]/20 px-3 py-1 text-xs font-semibold text-[#f59e0b]">
                    Estimated
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-white/70">
                  <span>Withdrawal Amount:</span>
                  <span className="text-white">
                    {isFinite(parsedAmt) ? parsedAmt.toFixed(2) : "0.00"} {coin}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Network Fee:</span>
                  <span className="text-red-400">
                    -{fee.toFixed(6)} {coin}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-white/70">
                  <span className="font-semibold">You'll Receive:</span>
                  <span className="font-semibold text-emerald-400">
                    {receive.toFixed(6)} {coin}
                  </span>
                </div>
              </div>
            </div>

            {/* Minimum notice */}
            <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-[2px] text-[#f59e0b]">ⓘ</span>
                <div>
                  <p className="font-semibold text-[#f59e0b]">
                    Minimum Withdrawal
                  </p>
                  <p className="mt-1 text-white/70">
                    Unable to load minimum - using default
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <FieldLabel>Withdrawal Address</FieldLabel>
              <Input
                value={address}
                onChange={setAddress}
                placeholder="Enter withdrawal address"
              />
              {addressRequired ? (
                <p className="mt-2 text-sm font-semibold text-red-400">
                  Withdrawal address is required
                </p>
              ) : null}
            </div>

            {/* Network info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white/80">Network Information</p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <span className="text-white">{network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmations Required:</span>
                  <span className="text-white">19</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Time:</span>
                  <span className="text-white">3-5 minutes</span>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="flex items-center gap-2 font-semibold text-red-300">
                ⚠️ Security Notice
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-200/80">
                <li>Double-check the withdrawal address - transactions cannot be reversed</li>
                <li>Ensure the network matches your destination wallet</li>
                <li>Withdrawals are reviewed and may take time to process</li>
                <li>Only withdraw to addresses you control</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              onClick={() => {
                setSubmitted(true);

                const ok =
                  !!coin &&
                  !!network &&
                  parsedAmt > 0 &&
                  address.trim().length >= 10;

                if (!ok) return;

                alert("Withdrawal submitted (demo). Next: save to DB + show in history.");
              }}
              className="w-full rounded-2xl border border-red-500/20 bg-red-600/30 px-4 py-4 font-semibold text-white/70"
            >
              ✈️ Review Withdrawal Request
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
