"use client";

import Link from "next/link";
import type { ReactNode } from "react";

function Card({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
          <div className="text-2xl">{icon}</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/60 leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f59e0b] text-black text-2xl font-extrabold">
        {n}
      </div>
      <div className="mt-4 text-xl font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</div>
    </div>
  );
}

function CheckItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25">
        <span className="text-emerald-300 text-sm">✓</span>
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-white/60 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="mx-auto max-w-md px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-2 text-xs text-[#fbbf24]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live Trading Available 24/7
        </div>

        <h1 className="mt-6 text-[40px] leading-[1.05] font-extrabold">
          Trade Crypto <span className="text-[#f59e0b]">Peer-to-Peer</span> with Confidence
        </h1>

        <p className="mt-4 text-base text-white/60 leading-relaxed">
          Buy and sell Bitcoin, USDT, Ethereum and more with verified traders worldwide. Secure escrow, instant settlements,
          and 24/7 support.
        </p>

        <div className="mt-7 space-y-3">
          <Link
            href="/register"
            className="block w-full rounded-full bg-[#f59e0b] py-4 text-center font-semibold text-black hover:bg-[#fbbf24] transition"
          >
            Start Trading Now →
          </Link>

          <a href="#learn" className="block w-full rounded-full border border-white/15 bg-white/5 py-4 text-center font-semibold text-white/90">
            Learn More
          </a>

          <button className="mx-auto mt-1 block rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-5 py-3 text-sm text-[#fbbf24]">
            View Security Certification
          </button>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="learn" className="mx-auto max-w-md px-4 py-8">
        <h2 className="text-3xl font-extrabold">
          Why Choose <span className="text-[#f59e0b]">Ydily</span>?
        </h2>
        <p className="mt-3 text-white/60 leading-relaxed">
          A modern P2P platform designed for speed, safety, and simple user experience.
        </p>

        <div className="mt-6 space-y-4">
          <Card icon="🛡️" title="Bank-Level Security" desc="Advanced protection layers and escrow flow to keep every trade controlled." />
          <Card icon="⚡" title="Instant Settlements" desc="Fast and efficient trade execution with real-time order tracking." />
          <Card icon="🌍" title="Global Access" desc="Trade with users across regions with flexible methods and availability." />
          <Card icon="👛" title="Multi-Crypto Support" desc="Trade USDT, BTC, ETH, LTC, SOL and more." />
          <Card icon="💬" title="24/7 Support" desc="Help when you need it, for account, escrow, or trade issues." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-md px-4 py-10">
        <h2 className="text-3xl font-extrabold text-center">How It Works</h2>
        <p className="mt-3 text-center text-white/60">Start trading in just 3 simple steps</p>

        <div className="mt-10 space-y-10">
          <Step n={1} title="Create Account" desc="Sign up with your email and complete verification in minutes." />
          <Step n={2} title="Find a Trade" desc="Browse offers and choose the best deal with the right limits." />
          <Step n={3} title="Complete Trade" desc="Make payment and receive crypto via secure escrow flow." />
        </div>
      </section>

      {/* PRIORITY */}
      <section className="mx-auto max-w-md px-4 py-10">
        <h2 className="text-3xl font-extrabold">
          <span className="text-[#f59e0b]">Priority</span>
        </h2>
        <p className="mt-3 text-white/60 leading-relaxed">
          We use multiple layers of protection to secure your assets and personal information.
        </p>

        <div className="mt-6 space-y-5">
          <CheckItem title="Two-Factor Authentication" desc="Secure your account with optional 2FA." />
          <CheckItem title="Secure Escrow System" desc="Funds are held until trade completion rules are met." />
          <CheckItem title="Device Management" desc="Monitor and control access to your account." />
          <CheckItem title="Withdrawal Protection" desc="Extra checks and verification for withdrawals." />
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-md px-4 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold">289M+</div>
              <div className="mt-1 text-sm text-white/60">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">$50M+</div>
              <div className="mt-1 text-sm text-white/60">Daily Volume</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">180+</div>
              <div className="mt-1 text-sm text-white/60">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">99.9%</div>
              <div className="mt-1 text-sm text-white/60">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-md px-4 pb-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <h3 className="text-3xl font-extrabold">Ready to Start Trading?</h3>
          <p className="mt-3 text-white/60 leading-relaxed">Create your Ydily account and start using the P2P platform.</p>

          <Link href="/register" className="mt-6 block w-full rounded-full bg-[#f59e0b] py-4 text-center font-semibold text-black">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-black">
              Y
            </div>
            <div>
              <div className="font-semibold">Ydily</div>
              <div className="text-sm text-white/60">The trusted P2P trading platform.</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-semibold">Products</div>
              <div className="mt-3 space-y-2 text-white/60">
                <div>P2P Trading</div>
                <div>Wallet</div>
                <div>Earn</div>
                <div>Withdraw</div>
              </div>
            </div>
            <div>
              <div className="font-semibold">Resources</div>
              <div className="mt-3 space-y-2 text-white/60">
                <div>How It Works</div>
                <div>Security</div>
                <div>Support</div>
                <div>Terms</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-white/40">© {new Date().getFullYear()} Ydily.com — All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
