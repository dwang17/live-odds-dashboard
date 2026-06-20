"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();

  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      //debug log statements
      // console.log("user id:", user.id);
      // console.log("profile:", profile);
      // console.log("error:", error);

      setUsername(profile?.username ?? user.email ?? null);
    }

    getUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold text-red-600">
          OddsRadar
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <Link href="/search" className="hover:text-red-600">
            Search
          </Link>

          {username ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
              >
                <span>{username}</span>
                <span className="text-xs">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={signOut}
                    className="block w-full px-4 py-3 text-left hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/signin" className="hover:text-red-600">
              Sign in
            </Link>
          )}

          {!username && (
            <Link href="/signup" className="hover:text-red-600">
              Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}