"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const isDisabled = !email.trim() || !password.trim();

async function signIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("email not confirmed") ||
      error.message.toLowerCase().includes("confirm")
    ) {
      window.location.href = "/confirm-email";
      return;
    }

    setMessageType("error");
    setMessage(error.message || "Unable to sign in.");
    return;
  }

  window.location.href = "/";
}

  return (
    <main className="min-h-screen mt-30 bg-gray-50 px-6 py-10">

      <section className="mx-auto mt-10 max-w-xl rounded-xl border border-gray-200 bg-white px-12 py-14 shadow-sm">
        <p className="text-gray-400">Please enter your details</p>
        <h1 className="mt-2 text-5xl font-bold text-gray-900">Welcome back</h1>

        <div className="mt-16 space-y-6">
          <input
            className="w-full rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none focus:border-red-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
            }}
          />

          <input
            className="w-full rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none focus:border-red-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage("");
            }}
          />

          {message ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={signIn}
            disabled={isDisabled}
            className="w-full rounded-lg bg-red-600 py-4 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Sign in
          </button>
        </div>

        <p className="mt-8 text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-red-600 underline">
            Sign up here
          </Link>
        </p>
      </section>
    </main>
  );
}