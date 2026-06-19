"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const isDisabled =
    !username.trim() ||
    !email.trim() ||
    password.length < 6;

  /* 
  Signup Flow:
  1. the frontend signup function is called to create user
  2. supabase creates auth.users row
  3. trigger fires off insert
  4. handle_new_user function runs, which creates a matching row in profiles table using their username
  5. redirect to confirm email page, which tells them to check their email for confirmation link
*/

  async function signUp() {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setMessage("Username must be at least 3 characters.");
      setMessageType("error");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to sign up.");
      return;
    }

    window.location.href = "/confirm-email";
  }

  return (
    <main className="min-h-screen mt-30 bg-gray-50 px-6 py-10">
      <Link href="/" className="text-3xl font-bold text-red-600">
        OddsRadar
      </Link>

      <section className="mx-auto mt-10 max-w-xl rounded-xl border border-gray-200 bg-white px-12 py-14 shadow-sm">
        <p className="text-gray-400">Create your account</p>
        <h1 className="mt-2 text-5xl font-bold text-gray-900">Sign up</h1>

        <div className="mt-16 space-y-6">
          <input
            className="w-full rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none focus:border-red-500"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setMessage("");
            }}
          />
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
              className={`rounded-lg border px-4 py-3 text-sm ${messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
            >
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={signUp}
            disabled={isDisabled}
            className="w-full rounded-lg bg-red-600 py-4 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Sign up
          </button>
        </div>

        <p className="mt-8 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-red-600 underline">
            Sign in here
          </Link>
        </p>
      </section>
    </main>
  );
}