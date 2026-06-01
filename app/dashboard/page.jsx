"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dashboardPathForRole } from "@/lib/auth/redirectByRole";
import { useAuthStore } from "@/store/authStore";

export default function DashboardIndexPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    router.replace(dashboardPathForRole(user.role));
  }, [hydrated, isAuthenticated, user, router]);

  return null;
}
