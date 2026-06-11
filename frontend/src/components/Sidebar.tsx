"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSportsList, SportConfig } from "@/lib/sports";

const groupIcons: Record<string, string> = {
  "American Football": "🏈",
  Baseball: "⚾",
  Basketball: "🏀",
  Soccer: "⚽",
  "Ice Hockey": "🏒",
  "Mixed Martial Arts": "🥊",
  Cricket: "🏏",
  "Rugby League": "🏉",
  "Aussie Rules": "🦘",
  Boxing: "🥊",
  Tennis: "🎾",
};

function getGroupIcon(group: string) {
  return groupIcons[group] ?? "🏅";
}

function groupSports(sports: SportConfig[]) {
  return sports.reduce((groups: Record<string, SportConfig[]>, sport) => {
    if (!groups[sport.group]) {
      groups[sport.group] = [];
    }
    groups[sport.group].push(sport);
    return groups;
  }, {});
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [sports, setSports] = useState<SportConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSports() {
      try {
        const data = await getSportsList();
        if (active) {
          setSports(data);
        }
      } catch (error) {
        console.error("Failed to load sports sidebar:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSports();

    return () => {
      active = false;
    };
  }, []);

  const groupedSports = useMemo(() => groupSports(sports), [sports]);

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
          className="mb-6 flex h-10 items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold hover:border-red-500 hover:bg-red-50"
        >
          ☰
        </button>

        <nav className={`space-y-5 overflow-y-auto pr-1 ${open ? "sidebar-scrollbar" : "sidebar-scrollbar-hidden"}`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {open ? "Loading leagues..." : "..."}
            </div>
          ) : (
            Object.entries(groupedSports).map(([group, groupLeagues]) => (
              <div key={group}>
                {open ? (
                  <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <span>{getGroupIcon(group)}</span>
                    <span>{group}</span>
                  </p>
                ) : (
                  <div className="mb-2 flex justify-center text-lg" title={group}>
                    {getGroupIcon(group)}
                  </div>
                )}

                <div className="space-y-1">
                  {groupLeagues.map((sport) => (
                    <Link
                      key={sport.key}
                      href={`/sports/${sport.key}`}
                      title={sport.title}
                      className={`
                flex items-center rounded-xl text-sm font-medium text-slate-700
                hover:bg-red-50 hover:text-red-600
                ${open ? "px-4 py-3" : "justify-center px-2 py-3"}
              `}
                    >
                      <span className="text-lg">{getGroupIcon(sport.group)}</span>
                      {open && <span className="ml-3">{sport.title}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
      </div>
    </aside>
  );
}