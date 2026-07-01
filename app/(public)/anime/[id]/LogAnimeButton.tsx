"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import LogAnimeModal from "@/components/diary/LogAnimeModal"

interface LogAnimeButtonProps {
  animeId: number
  animeTitle: string
  animeCoverUrl?: string | null
  genres?: string[]
}

export default function LogAnimeButton({ animeId, animeTitle, animeCoverUrl, genres }: LogAnimeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="w-full gap-2" onClick={() => setOpen(true)}>
        <BookOpen className="h-4 w-4" />
        Log this Anime
      </Button>
      <LogAnimeModal
        animeId={animeId}
        animeTitle={animeTitle}
        animeCoverUrl={animeCoverUrl}
        genres={genres}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => setOpen(false)}
      />
    </>
  )
}
