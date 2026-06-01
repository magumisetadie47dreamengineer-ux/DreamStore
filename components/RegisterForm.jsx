"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { homePathAfterLogin } from "@/lib/auth/redirectByRole";
import { brand } from "@/lib/brand";
import { useAuthStore } from "@/store/authStore";

function RegisterForm() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError("All fields are required");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "buyer",
        });
        setName("");
        setEmail("");
        setPassword("");
        router.push(homePathAfterLogin(data.user.role));
      } else {
        setError(data.message || "User registration failed");
      }
    } catch {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hydrated || isAuthenticated) {
    return null;
  }

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-sm border border-base-content/10 bg-base-200 p-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
          {brand.dreamChaser}
        </p>
        <h1 className="text-2xl font-bold mt-1">Create account</h1>
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
            <span className="label-text mb-1">Full name</span>
            <input
              id="register-name"
              name="register-name"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">Email</span>
            <input
              id="register-email"
              name="register-email"
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
              id="register-password"
              name="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>

          {error && (
            <div className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}

          <Link
            className="text-center text-sm text-base-content/70 hover:text-primary"
            href="/login"
          >
            Already have an account?{" "}
            <span className="underline">Sign in</span>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
