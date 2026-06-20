"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        window.location.href = "/signin";
        return;
      }

      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setUsername(profile?.username ?? null);
    }

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen mt-30 bg-gray-50 px-6 py-10">
      <section className="mx-auto mt-10 max-w-xl rounded-xl border border-gray-200 bg-white px-12 py-14 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Profile</h1>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-lg font-semibold text-gray-900">{username}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-lg font-semibold text-gray-900">{email}</p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          Back home
        </Link>
      </section>
    </main>
  );
}