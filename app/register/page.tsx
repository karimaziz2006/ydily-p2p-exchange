"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

const ACCOUNTS_KEY = "accounts_v1";
const USER_KEY = "current_user_id_v1";

type Account = {
  id: string;
  username: string;
  email: string;
  password: string; // demo only
};

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Account[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(items: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(items));
}

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return username.trim() && email.trim() && pw1.trim() && pw2.trim() && pw1 === pw2 && pw1.length >= 6;
  }, [username, email, pw1, pw2]);

  function createAccount() {
    if (!canSubmit) return;
    setLoading(true);

    const accounts = loadAccounts();
    const exists = accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      setLoading(false);
      alert("Email already used. Please log in.");
      router.push("/login");
      return;
    }

    const id = `u_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const newAcc: Account = {
      id,
      username: username.trim(),
      email: email.trim(),
      password: pw1,
    };

    saveAccounts([newAcc, ...accounts]);
    localStorage.setItem(USER_KEY, id);

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col justify-center">
      <div className="mb-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 backdrop-blur p-5">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl border-2 border-amber-500/60 bg-black/40 grid place-items-center">
            <div className="h-10 w-10 rounded-xl bg-white grid place-items-center">
              <span className="font-black text-black">Y</span>
            </div>
          </div>

          <div className="mt-4 text-3xl font-bold">Create Account</div>
          <div className="mt-1 text-white/60">Join Ydily P2P Trading Platform</div>
        </div>

        {/* Username */}
        <div className="mt-6">
          <div className="text-sm text-white/70 mb-2">Username</div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <User className="h-5 w-5 text-white/50" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mt-4">
          <div className="text-sm text-white/70 mb-2">Email Address</div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Mail className="h-5 w-5 text-white/50" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              type="email"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-4">
          <div className="text-sm text-white/70 mb-2">Password</div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Lock className="h-5 w-5 text-white/50" />
            <input
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              placeholder="Create a password (min 6 chars)"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              type={show1 ? "text" : "password"}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShow1((s) => !s)} className="text-white/60 hover:text-white">
              {show1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mt-4">
          <div className="text-sm text-white/70 mb-2">Confirm Password</div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Lock className="h-5 w-5 text-white/50" />
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              type={show2 ? "text" : "password"}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShow2((s) => !s)} className="text-white/60 hover:text-white">
              {show2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {pw1 && pw2 && pw1 !== pw2 && (
            <div className="mt-2 text-sm text-rose-300">Passwords do not match.</div>
          )}
        </div>

        <button
          onClick={createAccount}
          disabled={!canSubmit || loading}
          className={`mt-6 w-full rounded-2xl py-4 text-lg font-bold transition ${
            !canSubmit || loading
              ? "bg-amber-600/30 text-white/40 cursor-not-allowed"
              : "bg-amber-500 text-black hover:bg-amber-400"
          }`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <Link
          href="/login"
          className="mt-3 w-full inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4 text-lg font-semibold hover:bg-white/10"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
