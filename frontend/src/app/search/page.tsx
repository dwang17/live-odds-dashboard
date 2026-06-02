"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";

interface SearchResult {
  id: string;
  label: string;
  type: "team" | "player" | "event";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchSearchData = async () => {
    if (searchLoaded || loading || fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/search");

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        setAllResults([]);
        return;
      }

      const data = await response.json();
      setAllResults(Array.isArray(data) ? data : []);
      setSearchLoaded(true);
    } catch (error) {
      console.error("Search failed:", error);
      setAllResults([]);
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const handleSearchActivate = () => {
    setDropdownOpen(true);
    fetchSearchData();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = dropdownOpen
    ? query.trim().length >= 2
      ? allResults.filter((result) =>
          result.label.toLowerCase().includes(query.toLowerCase())
        )
      : allResults
    : [];

  return (
    <div>
      <Navbar />

      <main className="min-h-screen bg-neutral-100 px-8 py-6">
        <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <h1 className="mb-10 max-w-5xl text-4xl font-semibold tracking-wide">
            Search for a player or team...
          </h1>

          <div ref={containerRef} className="relative w-full max-w-5xl">
            <input
              type="text"
              value={query}
              onFocus={handleSearchActivate}
              onClick={handleSearchActivate}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a player or team..."
              className="
                h-20
                w-full
                rounded-3xl
                border
                border-gray-300
                bg-white
                px-8
                text-2xl
                outline-none
                shadow-sm
                transition-all
                focus:scale-[1.01]
                focus:border-red-500
              "
            />

            {dropdownOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-24 z-40 max-h-[50vh] overflow-y-auto rounded-2xl border border-gray-300 bg-white text-left shadow-lg">
                {results.map((result) => (
                  <button
                    key={result.id}
                    className="w-full px-6 py-4 text-left hover:bg-red-50"
                  >
                    <p className="text-lg font-semibold">{result.label}</p>
                    <p className="text-sm uppercase text-gray-500">
                      {result.type}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}