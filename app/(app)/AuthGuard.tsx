"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const USER_KEY = "current_user_id_v1"; // same key you already use

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only runs in browser
    const id = localStorage.getItem(USER_KEY);

    // If no session/user id => not logged in
    if (!id) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }

    setReady(true);
  }, [router, pathname]);

  // Prevent flashing the page before redirect check
  if (!ready) return null;

  return <>{children}</>;
}
