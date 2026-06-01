"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { homePathAfterLogin } from "@/lib/auth/redirectByRole";
import { signOut } from "@/lib/auth/signOut";
import { brand } from "@/lib/brand";
import { useAuthStore } from "@/store/authStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setEmail("");
    setPassword("");
    setError("");
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hydrated || !hasHydrated || !isAuthenticated) return;
    router.replace(homePathAfterLogin(user?.role, redirect));
  }, [hydrated, hasHydrated, isAuthenticated, user?.role, redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "buyer",
          branchId: data.user.branchId,
        });
        setEmail("");
        setPassword("");
        router.push(homePathAfterLogin(data.user.role, redirect));
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hydrated || !hasHydrated) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 py-12">
        <div className="w-full max-w-md rounded-sm border border-base-content/10 bg-base-200 p-8 text-center">
          <p className="text-sm text-base-content/60">
            Signed in as <span className="font-semibold">{user.email}</span>
          </p>
          <button
            type="button"
            onClick={() => signOut(router)}
            className="btn btn-outline btn-sm mt-6 rounded-sm"
          >
            Log out and use another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-sm border border-base-content/10 bg-base-200 p-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
          {brand.dreamChaser}
        </p>
        <h1 className="text-2xl font-bold mt-1">Sign in</h1>
        <p className="mt-2 text-sm italic text-primary/90">
          &ldquo;{brand.mantra}&rdquo;
        </p>
        <form
          onSubmit={handleSubmit}
          className="auth-form mt-6 flex flex-col gap-4"
          autoComplete="off"
          noValidate
        >
          <label className="form-control w-full">
            <span className="label-text mb-1">Email</span>
            <input
              id="login-email"
              name="login-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">Password</span>
            <input
              id="login-password"
              name="login-password"
              type="password"
              autoComplete="new-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary rounded-sm"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <div className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}
          <Link
            className="text-center text-sm text-base-content/70 hover:text-primary"
            href="/register"
          >
            Don&apos;t have an account?{" "}
            <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
