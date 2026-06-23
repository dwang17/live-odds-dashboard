"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FavoriteLeagueButtonProps = {
  sportKey: string;
  sportTitle: string;
  sportGroup?: string;
  userId: string;
  initiallyFavorited: boolean;
};

export default function FavoriteLeagueButton({
  sportKey,
  sportTitle,
  sportGroup,
  userId,
  initiallyFavorited,
}: FavoriteLeagueButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited);
  const [isHovering, setIsHovering] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createClient();

    if (isFavorited) {
      setIsFavorited(false);

      const { error } = await supabase
        .from("user_league_watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("sport_key", sportKey);

      if (error) {
        setIsFavorited(true);
        console.error(error);
      }

      return;
    }

    setIsFavorited(true);

    const { error } = await supabase.from("user_league_watchlist").insert({
      user_id: userId,
      sport_key: sportKey,
      sport_title: sportTitle,
      sport_group: sportGroup,
    });

    if (error) {
      setIsFavorited(false);
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
        isFavorited
          ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-600"
      }`}
    >
      {isFavorited
        ? isHovering
          ? "☆ Remove"
          : "⭐ Favorited"
        : "☆ Add to Watchlist"}
    </button>
  );
}