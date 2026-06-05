"use client";

import { useState } from "react";
import Link from "next/link";

const sports = [
  { name: "NBA", href: "/sports/nba", icon: "🏀" },
  { name: "MLB", href: "/sports/mlb", icon: "⚾" },
  { name: "NFL", href: "/sports/nfl", icon: "🏈" },
  { name: "NHL", href: "/sports/nhl", icon: "🏒" },
  { name: "Soccer", href: "/sports/soccer", icon: "⚽" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={`
        fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]
        border-r border-slate-300 bg-white
        transition-all duration-300
        ${open ? "w-64" : "w-20"}
      `}
    >
      <div className="flex h-full flex-col p-4">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="mb-6 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-red-500"
        >
          {open ? "☰" : "☰"}
        </button>
        
        {/* change to map different emojis later */}
        <nav className="space-y-2">
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
            >
              <span className="text-lg">{sport.icon}</span> 

              {open && (
                <span className="ml-3">
                  {sport.name}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}