"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
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
          {email ? (
            <>
              <span>{email}</span>
              <button onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/signin">Sign in</Link>
              <Link href="/signup">Sign up</Link>
            </>

          )}
        </div>
      </nav>
    </header>
  );
}