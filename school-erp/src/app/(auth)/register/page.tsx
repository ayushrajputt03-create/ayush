"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace("/setup");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">Register School</h1>
        <p className="mb-8 text-sm text-muted-foreground">Create your school ERP account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-card-foreground">Your Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Admin Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="admin@school.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-card-foreground">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-card-foreground">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
