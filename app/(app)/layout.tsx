"use client";

import "../globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";
import {
  Home,
  TrendingUp,
  Wallet,
  BarChart3,
  ArrowDownRight,
} from "lucide-react";

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: any;
}) {
  const pathname = usePathname();

  // exact match for dashboard, startsWith for others
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 text-xs transition ${
        active ? "text-emerald-400" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <AuthGuard>
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-black">
            {/* Main content */}
            <main className="px-4 pb-24 pt-4">{children}</main>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-[430px] items-center justify-between px-6 py-3">
                <NavItem href="/dashboard" label="Home" icon={Home} />
                <NavItem href="/p2p" label="P2P" icon={TrendingUp} />
                <NavItem href="/wallet" label="Wallet" icon={Wallet} />
                <NavItem href="/earn" label="Earn" icon={BarChart3} />
                <NavItem href="/withdraw" label="Withdraw" icon={ArrowDownRight} />
              </div>
            </nav>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
