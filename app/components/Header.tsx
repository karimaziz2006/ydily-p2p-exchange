"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-md flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ydily logo"
            width={28}
            height={28}
            priority
          />
        </Link>


        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-white/10 px-3 py-2"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      {open && (
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="rounded-2xl border border-white/10 bg-black/90 p-2 space-y-1">
            <Link
              href="/p2p"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm hover:bg-white/5"
            >
              P2P
            </Link>

            <div className="h-px bg-white/10 my-1" />

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm hover:bg-white/5"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-center text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
