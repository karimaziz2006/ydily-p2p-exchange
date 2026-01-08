"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  function signIn() {
    if (!canSubmit) return;
    setLoading(true);

    const accounts = loadAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );

    if (!found) {
      setLoading(false);
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem(USER_KEY, found.id);

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col justify-center">
      {/* Back */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
          ← Back
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0b1220]/70 backdrop-blur p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl border-2 border-amber-500/60 bg-black/40 grid place-items-center">
            <div className="h-10 w-10 rounded-xl bg-white grid place-items-center">
              <span className="font-black text-black">Y</span>
            </div>
          </div>

          <div className="mt-4 text-3xl font-bold">Welcome back</div>
          <div className="mt-1 text-white/60">Sign in to your Ydily account</div>
        </div>

        {/* Email */}
        <div className="mt-6">
          <div className="text-sm text-white/70 mb-2">Email Address</div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Mail className="h-5 w-5 text-white/50" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              type="email"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/70">Password</div>
            <button
              type="button"
              onClick={() => alert("Demo only — add reset flow later.")}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Forgot password?
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Lock className="h-5 w-5 text-white/50" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
              type={show ? "text" : "password"}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-white/60 hover:text-white">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={signIn}
          disabled={!canSubmit || loading}
          className={`mt-6 w-full rounded-2xl py-4 text-lg font-bold transition ${
            !canSubmit || loading
              ? "bg-amber-600/30 text-white/40 cursor-not-allowed"
              : "bg-amber-500 text-black hover:bg-amber-400"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* OR */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-white/50">OR</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Link
          href="/register"
          className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-4 text-lg font-semibold hover:bg-white/10"
        >
          <span className="text-xl">👤+</span>
          Create New Account
        </Link>

        <div className="mt-6 flex items-center justify-center gap-10 text-white/50 text-sm">
          <div className="flex items-center gap-2">🛡️ Secure</div>
          <div className="flex items-center gap-2">⚡ Fast</div>
          <div className="flex items-center gap-2">🌍 Global</div>
        </div>
      </div>
    </div>
  );
}
