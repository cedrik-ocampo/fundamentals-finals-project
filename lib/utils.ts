import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatRating(rating: number | null | undefined): string {
  if (rating == null) return "—"
  return rating % 1 === 0 ? `${rating}.0` : `${rating}`
}

export function currentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  let season: string
  if (month >= 1 && month <= 3) season = "WINTER"
  else if (month >= 4 && month <= 6) season = "SPRING"
  else if (month >= 7 && month <= 9) season = "SUMMER"
  else season = "FALL"
  return { season, year }
}
